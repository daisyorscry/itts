package db

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/url"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Connection interface {
	Run(ctx context.Context, fn func(ctx context.Context) error) error
	Get(ctx context.Context) *gorm.DB
}

type connection struct {
	db *gorm.DB
}

func Connect(host, user, password, name, port, sslmode, tz string) Connection {
	// urlencode timezone to avoid parsing issues
	tz = url.QueryEscape(tz)
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=%s",
		host, user, password, name, port, sslmode, tz,
	)

	gormLogger := logger.New(
		log.New(log.Writer(), "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold: time.Second,
			LogLevel:      logger.Warn,
			Colorful:      false,
		},
	)

	gdb, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormLogger,
	})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	sqlDB, err := gdb.DB()
	if err != nil {
		log.Fatalf("failed to get sqlDB: %v", err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(50)
	sqlDB.SetConnMaxLifetime(60 * time.Minute)

	return &connection{db: gdb}
}

func (c *connection) Run(ctx context.Context, fn func(ctx context.Context) error) error {
	return c.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		ctxWithTx := context.WithValue(ctx, txContextKey{}, tx)
		return fn(ctxWithTx)
	})
}

func (c *connection) Get(ctx context.Context) *gorm.DB {
	if tx, ok := ctx.Value(txContextKey{}).(*gorm.DB); ok && tx != nil {
		return tx.WithContext(ctx)
	}
	return c.db.WithContext(ctx)
}

func Ping(conn Connection) error {
	sqlDB, err := conn.Get(context.Background()).DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}

func SQL(conn Connection) *sql.DB {
	sqlDB, _ := conn.Get(context.Background()).DB()
	return sqlDB
}

type txContextKey struct{}
