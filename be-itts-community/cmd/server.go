package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/daisyorscry/itts/core"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
    redis "github.com/redis/go-redis/v9"
    newrelic "github.com/newrelic/go-agent/v3/newrelic"

	"go.uber.org/automaxprocs/maxprocs"

	"be-itts-community/config"
	"be-itts-community/internal/db"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
	routes "be-itts-community/route"
)

func main() {
	if undo, err := maxprocs.Set(); err == nil {
		defer undo()
	}

	cfg := config.LoadConfig()

	// core logger
	log := core.NewLogger(core.LogConfig{
		Level:       core.LogLevel(cfg.LogLevel),
		ServiceName: cfg.AppName,
		Environment: cfg.AppEnv,
		Pretty:      cfg.AppEnv != "production",
	})
	log.WithFields(map[string]any{"gomaxprocs": runtime.GOMAXPROCS(0)}).Info("starting app")

	// DB connect
	gormDB := db.Connect(cfg.DB.Host, cfg.DB.User, cfg.DB.Password, cfg.DB.Name, cfg.DB.Port, cfg.DB.SSLMode, cfg.DB.Timezone)
	sqlDB, err := gormDB.DB()
	if err != nil {
		log.Critical("failed to get sqlDB from gorm", err)
	}
	if err := sqlDB.Ping(); err != nil {
		log.Critical("failed to ping database", err)
	}
	log.WithFields(map[string]any{"host": cfg.DB.Host}).Info("database connected")

	r := chi.NewRouter()

	// Core middlewares
	r.Use(core.ContextMiddleware())
	r.Use(core.RecoveryMiddleware(log))
	r.Use(core.LoggingMiddleware(log))
	// Tracer: attempt New Relic if enabled and license present; fallback to noop
	var tracer nr.Tracer
	if cfg.NewRelic.Enabled && cfg.NewRelic.License != "" {
		app, err := newrelic.NewApplication(
			newrelic.ConfigAppName(cfg.NewRelic.AppName),
			newrelic.ConfigLicense(cfg.NewRelic.License),
			newrelic.ConfigDistributedTracerEnabled(true),
		)
		if err == nil {
			tracer = nr.NewNRTracer(app)
			log.Info("new relic enabled")
		} else {
			log.WithError(err).Warn("failed to init new relic; using noop tracer")
			tracer = nr.NewNoopTracer()
		}
	} else {
		tracer = nr.NewNoopTracer()
	}
	r.Use(nr.Middleware(tracer))

	// CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://127.0.0.1:3000", "https://itts-community.daisyorscry.sbs"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Requested-With"},
		ExposedHeaders:   []string{"Link", "X-Request-Id"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health endpoints
	r.Get("/", func(w http.ResponseWriter, req *http.Request) {
		core.OK(w, req, map[string]any{"message": "Hello from ITTS Community Backend"})
	})
	r.Get("/healthz", func(w http.ResponseWriter, req *http.Request) {
		core.NoContent(w, req)
	})
	r.Get("/readyz", func(w http.ResponseWriter, req *http.Request) {
		if err := sqlDB.Ping(); err != nil {
			core.WriteError(w, req, http.StatusServiceUnavailable, "UNHEALTHY", err.Error(), nil)
			return
		}
		core.OK(w, req, map[string]any{"status": "ok"})
	})

	// Wire repository tracer for instrumentation
	repository.RepoTracer = tracer

	// Locker: use Redis if configured; else noop
	locker := lock.NewNoopLocker()
	if cfg.Redis.Addr != "" {
		client := redis.NewClient(&redis.Options{Addr: cfg.Redis.Addr, Password: cfg.Redis.Password, DB: cfg.Redis.DB})
		if err := client.Ping(context.Background()).Err(); err != nil {
			log.WithError(err).Warn("failed to connect redis; using noop locker")
		} else {
			locker = lock.NewRedisLocker(client)
			log.Info("redis locker enabled")
		}
	}

	// Routes
	routes.RegisterRoutes(r, routes.RouteDeps{
		DB:             gormDB,
		VerifyEmailURL: cfg.VerifyEmailURL,
		Mailer:         nil,
		Locker:         locker,
		Tracer:         tracer,
	})

	port := cfg.AppPort
	if port == "" {
		port = "3000"
	}

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", port),
		Handler:      r,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	errCh := make(chan error, 1)
	go func() {
		log.WithFields(map[string]any{"addr": srv.Addr}).Info("listening")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errCh <- err
		}
	}()

	select {
	case <-ctx.Done():
		log.Info("shutdown signal received")
	case err := <-errCh:
		log.WithError(err).Error("http server error")
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.WithError(err).Error("failed to shutdown server")
	}

	if err := sqlDB.Close(); err != nil {
		log.WithError(err).Warn("failed to close db")
	}

	log.Info("server stopped cleanly")
	os.Exit(0)
}
