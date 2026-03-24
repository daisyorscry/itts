package db

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/daisyorscry/itts/core"
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

func Connect(host, user, password, name, port, sslmode, tz string, log *core.Logger, appEnv string) Connection {
	// Build DSN without URL encoding timezone - PostgreSQL driver handles it directly
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=%s",
		host, user, password, name, port, sslmode, tz,
	)

	gdb, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: newGormLogger(log, time.Second, resolveGormLogLevel(appEnv)),
	})
	if err != nil {
		log.Fatal(fmt.Sprintf("failed to connect database: %v", err))
	}

	sqlDB, err := gdb.DB()
	if err != nil {
		log.Fatal(fmt.Sprintf("failed to get sqlDB: %v", err))
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

type gormCoreLogger struct {
	log           *core.Logger
	slowThreshold time.Duration
	logLevel      logger.LogLevel
}

func newGormLogger(log *core.Logger, slowThreshold time.Duration, logLevel logger.LogLevel) logger.Interface {
	return &gormCoreLogger{
		log:           log,
		slowThreshold: slowThreshold,
		logLevel:      logLevel,
	}
}

func (l *gormCoreLogger) LogMode(level logger.LogLevel) logger.Interface {
	return &gormCoreLogger{
		log:           l.log,
		slowThreshold: l.slowThreshold,
		logLevel:      level,
	}
}

func (l *gormCoreLogger) Info(ctx context.Context, msg string, data ...interface{}) {
	if l.logLevel < logger.Info {
		return
	}

	l.log.WithContext(ctx).Info(fmt.Sprintf(msg, data...))
}

func (l *gormCoreLogger) Warn(ctx context.Context, msg string, data ...interface{}) {
	if l.logLevel < logger.Warn {
		return
	}

	l.log.WithContext(ctx).Warn(fmt.Sprintf(msg, data...))
}

func (l *gormCoreLogger) Error(ctx context.Context, msg string, data ...interface{}) {
	if l.logLevel < logger.Error {
		return
	}

	l.log.WithContext(ctx).Error(fmt.Sprintf(msg, data...))
}

func (l *gormCoreLogger) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
	if l.logLevel == logger.Silent {
		return
	}

	elapsed := time.Since(begin)
	sql, rows := fc()

	fields := map[string]any{
		"event_type":    "database_query",
		"duration_ms":   elapsed.Milliseconds(),
		"rows_affected": rows,
		"query":         sql,
	}

	switch {
	case err != nil && l.logLevel >= logger.Error:
		l.log.WithContext(ctx).WithFields(fields).WithError(err).Error("database query failed")
	case l.slowThreshold > 0 && elapsed > l.slowThreshold && l.logLevel >= logger.Warn:
		l.log.WithContext(ctx).WithFields(fields).Warn("slow database query")
	case l.logLevel >= logger.Info:
		l.log.WithContext(ctx).WithFields(fields).Info("database query executed")
	}
}

func resolveGormLogLevel(appEnv string) logger.LogLevel {
	return logger.Error
}
