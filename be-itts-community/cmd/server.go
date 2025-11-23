package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors" // <-- CORS
	"github.com/gofiber/fiber/v2/middleware/recover"
	"go.uber.org/automaxprocs/maxprocs"
	"go.uber.org/zap"

	"be-itts-community/config"
	"be-itts-community/internal/db"
	"be-itts-community/internal/logger"
	routes "be-itts-community/route"
)

func main() {
	if undo, err := maxprocs.Set(); err == nil {
		defer undo()
	}

	cfg := config.LoadConfig()

	log := logger.NewLogger(cfg.LogLevel)
	defer func() { _ = log.Sync() }()
	log.Info("starting app", zap.String("env", cfg.AppEnv), zap.Int("gomaxprocs", runtime.GOMAXPROCS(0)))

	gormDB := db.Connect(cfg.DB.Host, cfg.DB.User, cfg.DB.Password, cfg.DB.Name, cfg.DB.Port, cfg.DB.SSLMode, cfg.DB.Timezone)
	sqlDB, err := gormDB.DB()
	if err != nil {
		log.Fatal("failed to get sqlDB from gorm", zap.Error(err))
	}
	if err := sqlDB.Ping(); err != nil {
		log.Fatal("failed to ping database", zap.Error(err))
	}
	log.Info("database connected", zap.String("host", cfg.DB.Host))

	app := fiber.New(fiber.Config{
		Prefork:      cfg.Prefork,
		IdleTimeout:  60 * time.Second,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		AppName:      "ITTS Community Backend",
	})

	app.Use(recover.New(recover.Config{
		EnableStackTrace: true,
		StackTraceHandler: func(c *fiber.Ctx, e any) {
			log.Error("panic recovered", zap.Any("error", e))
		},
	}))

	// ---------- CORS ----------
	// Izinkan FE dev di localhost & 127.0.0.1:3000. Jika pakai cookie/withCredentials=true, AllowCredentials harus true
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, http://127.0.0.1:3000, https://itts-community.daisyorscry.sbs",
		AllowMethods:     "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowHeaders:     "Content-Type, Authorization, Accept, X-Requested-With",
		AllowCredentials: true, // set sesuai kebutuhan FE kamu
		MaxAge:           300,  // cache preflight 5 menit
	}))
	// Preflight fallback (beberapa setup butuh explicit handler)
	app.Options("/*", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusNoContent)
	})
	// ---------- end CORS ----------

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"message": "Hello from ITTS Community Backend"})
	})
	app.Get("/healthz", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK)
	})
	app.Get("/readyz", func(c *fiber.Ctx) error {
		if err := sqlDB.Ping(); err != nil {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
				"status": "unhealthy",
				"error":  err.Error(),
			})
		}
		return c.JSON(fiber.Map{"status": "ok"})
	})

	routes.RegisterRoutes(app, routes.RouteDeps{
		DB:             gormDB,
		VerifyEmailURL: cfg.VerifyEmailURL,
		Mailer:         nil,
	})

	printRoutes(app, log)

	port := cfg.AppPort
	if port == "" {
		port = "3000"
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	errCh := make(chan error, 1)
	go func() {
		addr := fmt.Sprintf(":%s", port)
		log.Info("listening", zap.String("addr", addr), zap.Bool("prefork", cfg.Prefork))
		if err := app.Listen(addr); err != nil {
			errCh <- err
		}
	}()

	select {
	case <-ctx.Done():
		log.Info("shutdown signal received, closing server...")
	case err := <-errCh:
		log.Error("fiber server error", zap.Error(err))
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := app.Shutdown(); err != nil {
		log.Error("failed to shutdown fiber", zap.Error(err))
	}

	done := make(chan struct{})
	go func() {
		if err := sqlDB.Close(); err != nil {
			log.Error("failed to close db", zap.Error(err))
		}
		close(done)
	}()

	select {
	case <-done:
	case <-shutdownCtx.Done():
		log.Warn("forced exit before db closed")
	}

	log.Info("server stopped cleanly")
	os.Exit(0)
}

func printRoutes(app *fiber.App, log *zap.Logger) {
	for _, r := range app.GetRoutes() {
		log.Info("route",
			zap.String("method", r.Method),
			zap.String("path", r.Path),
			zap.String("name", r.Name),
		)
	}
}
