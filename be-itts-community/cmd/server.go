package main

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"runtime"
	"strings"
	"syscall"
	"time"

	"github.com/daisyorscry/itts/core"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	newrelic "github.com/newrelic/go-agent/v3/newrelic"
	"github.com/pressly/goose/v3"
	redis "github.com/redis/go-redis/v9"

	"go.uber.org/automaxprocs/maxprocs"

	"be-itts-community/config"
	"be-itts-community/internal/db"
	"be-itts-community/internal/handler/rest"
	"be-itts-community/internal/repository"
	"be-itts-community/internal/service"
	"be-itts-community/pkg/lock"
	mailerpkg "be-itts-community/pkg/mailer"
	midtranspkg "be-itts-community/pkg/midtrans"
	"be-itts-community/pkg/observability/nr"
	storagepkg "be-itts-community/pkg/storage"
	routes "be-itts-community/route"
)

func isAllowedOrigin(origin string, configuredOrigins []string) bool {
	origin = strings.TrimSpace(origin)
	if origin == "" {
		return false
	}

	for _, allowed := range configuredOrigins {
		if origin == strings.TrimSpace(allowed) {
			return true
		}
	}

	parsedOrigin, err := url.Parse(origin)
	if err != nil || parsedOrigin.Scheme != "https" {
		return false
	}

	return strings.HasSuffix(parsedOrigin.Hostname(), "-v2-figmaiframepreview.figma.site")
}

func runMigrations(sqlDB *sql.DB, log *core.Logger, migrationsDir string) error {
	if err := goose.SetDialect("postgres"); err != nil {
		return fmt.Errorf("failed to set goose dialect: %w", err)
	}

	if err := goose.Up(sqlDB, migrationsDir); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	return nil
}

func resetPublicSchema(sqlDB *sql.DB) error {
	if _, err := sqlDB.Exec(`DROP SCHEMA IF EXISTS public CASCADE`); err != nil {
		return fmt.Errorf("failed to drop public schema: %w", err)
	}
	if _, err := sqlDB.Exec(`CREATE SCHEMA public`); err != nil {
		return fmt.Errorf("failed to recreate public schema: %w", err)
	}
	if _, err := sqlDB.Exec(`GRANT ALL ON SCHEMA public TO public`); err != nil {
		return fmt.Errorf("failed to grant schema permissions: %w", err)
	}
	if _, err := sqlDB.Exec(`GRANT ALL ON SCHEMA public TO current_user`); err != nil {
		return fmt.Errorf("failed to grant current_user schema permissions: %w", err)
	}
	return nil
}

func main() {
	if undo, err := maxprocs.Set(); err == nil {
		defer undo()
	}

	cfg := config.LoadConfig()

	// core logger
	log := core.NewLogger(core.LogConfig{
		Level:         core.LogLevel(cfg.LogLevel),
		ServiceName:   cfg.AppName,
		Environment:   cfg.AppEnv,
		Pretty:        cfg.AppEnv != "production",
		ErrorFilePath: cfg.LogErrorFile,
	})
	core.InitGlobalLogger(core.LogConfig{
		Level:         core.LogLevel(cfg.LogLevel),
		ServiceName:   cfg.AppName,
		Environment:   cfg.AppEnv,
		Pretty:        cfg.AppEnv != "production",
		ErrorFilePath: cfg.LogErrorFile,
	})
	log.WithFields(map[string]any{"gomaxprocs": runtime.GOMAXPROCS(0)}).Info("starting app")

	// DB connect
	dbConn := db.Connect(cfg.DB.Host, cfg.DB.User, cfg.DB.Password, cfg.DB.Name, cfg.DB.Port, cfg.DB.SSLMode, cfg.DB.Timezone, log, cfg.AppEnv)
	baseDB := dbConn.Get(context.Background())
	sqlDB, err := baseDB.DB()
	if err != nil {
		log.Critical("failed to get sqlDB from gorm", err)
	}
	if err := sqlDB.Ping(); err != nil {
		log.Critical("failed to ping database", err)
	}
	log.WithFields(map[string]any{"host": cfg.DB.Host}).Info("database connected")

	// Run migrations automatically
	if cfg.DB.FreshSeed {
		log.Warn("DB_FRESH_SEED enabled: resetting public schema before migrations")
		if err := resetPublicSchema(sqlDB); err != nil {
			log.Critical("failed to reset database schema", err)
			return
		}
	}
	log.Info("running database migrations")
	if err := runMigrations(sqlDB, log, "./migrations"); err != nil {
		log.Critical("failed to run migrations", err)
		return
	}
	log.Info("migrations completed successfully")
	if cfg.MigrationOnly {
		log.Info("migration-only mode enabled; exiting after successful migrations")
		if err := sqlDB.Close(); err != nil {
			log.WithError(err).Error("failed to close database connection")
		}
		return
	}

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
			newrelic.ConfigAIMonitoringEnabled(true),
			newrelic.ConfigCustomInsightsEventsMaxSamplesStored(100000),
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
		AllowedOrigins: []string{},
		AllowOriginFunc: func(r *http.Request, origin string) bool {
			return isAllowedOrigin(origin, cfg.Cors)
		},
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

	// Parse JWT durations
	jwtAccessDur, err := time.ParseDuration(cfg.JWT.AccessDuration)
	if err != nil {
		log.WithError(err).Warn("invalid JWT access duration, using default 15m")
		jwtAccessDur = 15 * time.Minute
	}
	jwtRefreshDur, err := time.ParseDuration(cfg.JWT.RefreshDuration)
	if err != nil {
		log.WithError(err).Warn("invalid JWT refresh duration, using default 168h")
		jwtRefreshDur = 168 * time.Hour
	}

	var configuredMailer service.Mailer
	if cfg.Mail.Host != "" && cfg.Mail.Port > 0 && cfg.Mail.From != "" {
		configuredMailer = mailerpkg.NewSMTPMailer(cfg.Mail.Host, cfg.Mail.Port, cfg.Mail.User, cfg.Mail.Password, cfg.Mail.From)
	}

	var midtransClient *midtranspkg.Client
	if cfg.Midtrans.ServerKey != "" {
		midtransClient = midtranspkg.NewClient(cfg.Midtrans.ServerKey, cfg.Midtrans.IsProduction)
	}

	var objectStorage rest.ObjectStorage
	if cfg.Storage.Endpoint != "" && cfg.Storage.AccessKey != "" && cfg.Storage.SecretKey != "" {
		minioClient, err := storagepkg.NewMinIOClient(cfg.Storage.Endpoint, cfg.Storage.AccessKey, cfg.Storage.SecretKey, cfg.Storage.UseSSL)
		if err != nil {
			log.Critical("failed to initialize minio client", err)
			return
		}
		objectStorage = minioClient
		log.WithFields(map[string]any{
			"endpoint": cfg.Storage.Endpoint,
			"bucket":   cfg.Storage.Bucket,
		}).Info("object storage enabled")
	}

	// Routes
	routes.RegisterRoutes(r, routes.RouteDeps{
		DBConn:             dbConn,
		FrontendBaseURL:    cfg.FrontendBaseURL,
		Mailer:             configuredMailer,
		ObjectStorage:      objectStorage,
		StorageBucket:      cfg.Storage.Bucket,
		Locker:             locker,
		Tracer:             tracer,
		JWTSecret:          cfg.JWT.Secret,
		JWTAccessDur:       jwtAccessDur,
		JWTRefreshDur:      jwtRefreshDur,
		JWTIssuer:          cfg.JWT.Issuer,
		MidtransClient:     midtransClient,
		GitHubClientID:     cfg.OAuth.GitHub.ClientID,
		GitHubClientSecret: cfg.OAuth.GitHub.ClientSecret,
		GitHubRedirectURI:  cfg.OAuth.GitHub.RedirectURI,
	})

	port := cfg.AppPort
	if port == "" {
		port = "3000"
	}

	host := cfg.AppHost
	if host == "" {
		host = "0.0.0.0"
	}

	srv := &http.Server{
		Addr:         fmt.Sprintf("%s:%s", host, port),
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
