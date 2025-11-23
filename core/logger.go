package core

import (
	"context"
	"io"
	"os"
	"time"

	"github.com/rs/zerolog"
)

// LogLevel represents log levels
type LogLevel string

const (
	LevelDebug LogLevel = "debug"
	LevelInfo  LogLevel = "info"
	LevelWarn  LogLevel = "warn"
	LevelError LogLevel = "error"
	LevelFatal LogLevel = "fatal"
)

// LogConfig holds logger configuration
type LogConfig struct {
	Level       LogLevel // Log level
	ServiceName string   // Service name (e.g., "control-plane-api")
	Environment string   // Environment (e.g., "production", "staging", "development")
	Pretty      bool     // Pretty print for development
	Output      io.Writer
}

// Logger wraps zerolog with additional functionality
type Logger struct {
	logger      zerolog.Logger
	serviceName string
	environment string
}

// NewLogger creates a new logger instance
func NewLogger(cfg LogConfig) *Logger {
	// Set log level
	level := parseLogLevel(cfg.Level)
	zerolog.SetGlobalLevel(level)

	// Configure time format (RFC3339 for compatibility with Loki)
	zerolog.TimeFieldFormat = time.RFC3339

	// Set output
	output := cfg.Output
	if output == nil {
		output = os.Stdout
	}

	// Create logger
	var zlog zerolog.Logger
	if cfg.Pretty {
		zlog = zerolog.New(zerolog.ConsoleWriter{
			Out:        output,
			TimeFormat: time.RFC3339,
		}).With().Timestamp().Logger()
	} else {
		zlog = zerolog.New(output).With().Timestamp().Logger()
	}

	// Add service metadata
	zlog = zlog.With().
		Str("service", cfg.ServiceName).
		Str("environment", cfg.Environment).
		Str("hostname", getHostname()).
		Logger()

	return &Logger{
		logger:      zlog,
		serviceName: cfg.ServiceName,
		environment: cfg.Environment,
	}
}

// WithContext extracts logger from context or returns current logger
func (l *Logger) WithContext(ctx context.Context) *Logger {
	if ctx == nil {
		return l
	}

	// Extract context values
	newLogger := l.logger

	if requestID := GetRequestIDFromContext(ctx); requestID != "" {
		newLogger = newLogger.With().Str("request_id", requestID).Logger()
	}

	if userID := GetUserIDFromContext(ctx); userID != "" {
		newLogger = newLogger.With().Str("user_id", userID).Logger()
	}

	if orgID := GetOrgIDFromContext(ctx); orgID != "" {
		newLogger = newLogger.With().Str("org_id", orgID).Logger()
	}

	if traceID := GetTraceIDFromContext(ctx); traceID != "" {
		newLogger = newLogger.With().Str("trace_id", traceID).Logger()
	}

	return &Logger{
		logger:      newLogger,
		serviceName: l.serviceName,
		environment: l.environment,
	}
}

// WithFields adds structured fields to logger
func (l *Logger) WithFields(fields map[string]interface{}) *Logger {
	ctx := l.logger.With()
	for k, v := range fields {
		ctx = ctx.Interface(k, v)
	}

	return &Logger{
		logger:      ctx.Logger(),
		serviceName: l.serviceName,
		environment: l.environment,
	}
}

// WithField adds a single field to logger
func (l *Logger) WithField(key string, value interface{}) *Logger {
	return &Logger{
		logger:      l.logger.With().Interface(key, value).Logger(),
		serviceName: l.serviceName,
		environment: l.environment,
	}
}

// WithError adds error to logger context
func (l *Logger) WithError(err error) *Logger {
	return &Logger{
		logger:      l.logger.With().Err(err).Logger(),
		serviceName: l.serviceName,
		environment: l.environment,
	}
}

// Debug logs debug message
func (l *Logger) Debug(msg string) {
	l.logger.Debug().Msg(msg)
}

// Debugf logs formatted debug message
func (l *Logger) Debugf(format string, v ...interface{}) {
	l.logger.Debug().Msgf(format, v...)
}

// Info logs info message
func (l *Logger) Info(msg string) {
	l.logger.Info().Msg(msg)
}

// Infof logs formatted info message
func (l *Logger) Infof(format string, v ...interface{}) {
	l.logger.Info().Msgf(format, v...)
}

// Warn logs warning message
func (l *Logger) Warn(msg string) {
	l.logger.Warn().Msg(msg)
}

// Warnf logs formatted warning message
func (l *Logger) Warnf(format string, v ...interface{}) {
	l.logger.Warn().Msgf(format, v...)
}

// Error logs error message
func (l *Logger) Error(msg string) {
	l.logger.Error().Msg(msg)
}

// Errorf logs formatted error message
func (l *Logger) Errorf(format string, v ...interface{}) {
	l.logger.Error().Msgf(format, v...)
}

// Fatal logs fatal message and exits
func (l *Logger) Fatal(msg string) {
	l.logger.Fatal().Msg(msg)
}

// Fatalf logs formatted fatal message and exits
func (l *Logger) Fatalf(format string, v ...interface{}) {
	l.logger.Fatal().Msgf(format, v...)
}

// Critical logs critical error (for alerting)
// This should trigger alerts in Prometheus/Alertmanager
func (l *Logger) Critical(msg string, err error) {
	l.logger.Error().
		Err(err).
		Bool("critical", true).
		Str("severity", "critical").
		Msg(msg)
}

// Criticalf logs formatted critical error
func (l *Logger) Criticalf(err error, format string, v ...interface{}) {
	l.logger.Error().
		Err(err).
		Bool("critical", true).
		Str("severity", "critical").
		Msgf(format, v...)
}

// LogServiceState logs service state changes
func (l *Logger) LogServiceState(state, action string, metadata map[string]interface{}) {
	event := l.logger.Info().
		Str("event_type", "service_state").
		Str("state", state).
		Str("action", action)

	for k, v := range metadata {
		event = event.Interface(k, v)
	}

	event.Msg("Service state changed")
}

// LogDatabaseQuery logs database queries (for debugging)
func (l *Logger) LogDatabaseQuery(query string, duration time.Duration, err error) {
	event := l.logger.Debug().
		Str("event_type", "database_query").
		Str("query", query).
		Dur("duration_ms", duration)

	if err != nil {
		event = event.Err(err).Bool("success", false)
	} else {
		event = event.Bool("success", true)
	}

	event.Msg("Database query executed")
}

// LogHTTPRequest logs HTTP requests
func (l *Logger) LogHTTPRequest(method, path string, statusCode int, duration time.Duration, metadata map[string]interface{}) {
	event := l.logger.Info().
		Str("event_type", "http_request").
		Str("method", method).
		Str("path", path).
		Int("status_code", statusCode).
		Dur("duration_ms", duration)

	for k, v := range metadata {
		event = event.Interface(k, v)
	}

	event.Msg("HTTP request processed")
}

// LogMQEvent logs message queue events
func (l *Logger) LogMQEvent(eventType, topic string, success bool, metadata map[string]interface{}) {
	event := l.logger.Info().
		Str("event_type", "mq_event").
		Str("mq_event_type", eventType).
		Str("topic", topic).
		Bool("success", success)

	for k, v := range metadata {
		event = event.Interface(k, v)
	}

	event.Msg("Message queue event")
}

// LogAudit logs audit events (security, compliance)
func (l *Logger) LogAudit(actor, action, resource string, metadata map[string]interface{}) {
	event := l.logger.Info().
		Str("event_type", "audit").
		Str("actor", actor).
		Str("action", action).
		Str("resource", resource)

	for k, v := range metadata {
		event = event.Interface(k, v)
	}

	event.Msg("Audit event")
}

// Helper functions

func parseLogLevel(level LogLevel) zerolog.Level {
	switch level {
	case LevelDebug:
		return zerolog.DebugLevel
	case LevelInfo:
		return zerolog.InfoLevel
	case LevelWarn:
		return zerolog.WarnLevel
	case LevelError:
		return zerolog.ErrorLevel
	case LevelFatal:
		return zerolog.FatalLevel
	default:
		return zerolog.InfoLevel
	}
}

func getHostname() string {
	hostname, err := os.Hostname()
	if err != nil {
		return "unknown"
	}
	return hostname
}

// Global logger instance (optional, for convenience)
var globalLogger *Logger

// InitGlobalLogger initializes global logger
func InitGlobalLogger(cfg LogConfig) {
	globalLogger = NewLogger(cfg)
}

// GetGlobalLogger returns global logger instance
func GetGlobalLogger() *Logger {
	if globalLogger == nil {
		// Fallback to default logger
		globalLogger = NewLogger(LogConfig{
			Level:       LevelInfo,
			ServiceName: "unknown",
			Environment: "development",
			Pretty:      true,
		})
	}
	return globalLogger
}

// Convenience functions using global logger

func Debug(msg string) {
	GetGlobalLogger().Debug(msg)
}

func Debugf(format string, v ...interface{}) {
	GetGlobalLogger().Debugf(format, v...)
}

func Info(msg string) {
	GetGlobalLogger().Info(msg)
}

func Infof(format string, v ...interface{}) {
	GetGlobalLogger().Infof(format, v...)
}

func Warn(msg string) {
	GetGlobalLogger().Warn(msg)
}

func Warnf(format string, v ...interface{}) {
	GetGlobalLogger().Warnf(format, v...)
}

func Error(msg string) {
	GetGlobalLogger().Error(msg)
}

func Errorf(format string, v ...interface{}) {
	GetGlobalLogger().Errorf(format, v...)
}

func Fatal(msg string) {
	GetGlobalLogger().Fatal(msg)
}

func Fatalf(format string, v ...interface{}) {
	GetGlobalLogger().Fatalf(format, v...)
}

func Critical(msg string, err error) {
	GetGlobalLogger().Critical(msg, err)
}

func Criticalf(err error, format string, v ...interface{}) {
	GetGlobalLogger().Criticalf(err, format, v...)
}
