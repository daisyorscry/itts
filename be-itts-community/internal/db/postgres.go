package db

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(host, user, password, name, port, sslmode, tz string) *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=%s",
		host, user, password, name, port, sslmode, tz,
	)

	gormLogger := logger.New(
		log.New(log.Writer(), "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold: time.Second,
			LogLevel:      logger.Info,
			Colorful:      true,
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

	return gdb
}

func Ping(gdb *gorm.DB) error {
	sqlDB, err := gdb.DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}

func SQL(gdb *gorm.DB) *sql.DB {
	sqlDB, _ := gdb.DB()
	return sqlDB
}
