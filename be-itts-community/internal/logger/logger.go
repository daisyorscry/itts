package logger

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func NewLogger(level string) *zap.Logger {
	var zapConfig zap.Config

	if level == "production" {
		zapConfig = zap.NewProductionConfig()
	} else {
		zapConfig = zap.NewDevelopmentConfig()
	}

	lvl := zapcore.DebugLevel
	if err := lvl.Set(level); err == nil {
		zapConfig.Level = zap.NewAtomicLevelAt(lvl)
	}

	logger, err := zapConfig.Build()
	if err != nil {
		panic(err)
	}

	return logger
}
