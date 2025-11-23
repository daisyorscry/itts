package core

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestNewLogger(t *testing.T) {
	buf := &bytes.Buffer{}
	cfg := LogConfig{
		Level:       LevelInfo,
		ServiceName: "test-service",
		Environment: "test",
		Pretty:      false,
		Output:      buf,
	}

	logger := NewLogger(cfg)

	assert.NotNil(t, logger)
	assert.Equal(t, "test-service", logger.serviceName)
	assert.Equal(t, "test", logger.environment)
}

func TestLogger_Info(t *testing.T) {
	buf := &bytes.Buffer{}
	cfg := LogConfig{
		Level:       LevelInfo,
		ServiceName: "test-service",
		Environment: "test",
		Pretty:      false,
		Output:      buf,
	}

	logger := NewLogger(cfg)
	logger.Info("test message")

	var logEntry map[string]interface{}
	err := json.Unmarshal(buf.Bytes(), &logEntry)
	assert.NoError(t, err)

	assert.Equal(t, "info", logEntry["level"])
	assert.Equal(t, "test message", logEntry["message"])
	assert.Equal(t, "test-service", logEntry["service"])
	assert.Equal(t, "test", logEntry["environment"])
}

func TestLogger_WithFields(t *testing.T) {
	buf := &bytes.Buffer{}
	cfg := LogConfig{
		Level:       LevelInfo,
		ServiceName: "test-service",
		Environment: "test",
		Pretty:      false,
		Output:      buf,
	}

	logger := NewLogger(cfg)
	logger.WithFields(map[string]interface{}{
		"user_id": "usr_123",
		"action":  "login",
	}).Info("user logged in")

	var logEntry map[string]interface{}
	err := json.Unmarshal(buf.Bytes(), &logEntry)
	assert.NoError(t, err)

	assert.Equal(t, "usr_123", logEntry["user_id"])
	assert.Equal(t, "login", logEntry["action"])
}

func TestLogger_WithField(t *testing.T) {
	buf := &bytes.Buffer{}
	cfg := LogConfig{
		Level:       LevelInfo,
		ServiceName: "test-service",
		Environment: "test",
		Pretty:      false,
		Output:      buf,
	}

	logger := NewLogger(cfg)
	logger.WithField("request_id", "req_123").Info("processing request")

	var logEntry map[string]interface{}
	err := json.Unmarshal(buf.Bytes(), &logEntry)
	assert.NoError(t, err)

	assert.Equal(t, "req_123", logEntry["request_id"])
}

func TestLogger_WithError(t *testing.T) {
	buf := &bytes.Buffer{}
	cfg := LogConfig{
		Level:       LevelInfo,
		ServiceName: "test-service",
		Environment: "test",
		Pretty:      false,
		Output:      buf,
	}

	logger := NewLogger(cfg)
	testErr := errors.New("test error")
	logger.WithError(testErr).Error("operation failed")

	var logEntry map[string]interface{}
	err := json.Unmarshal(buf.Bytes(), &logEntry)
	assert.NoError(t, err)

	assert.Equal(t, "error", logEntry["level"])
	assert.Equal(t, "test error", logEntry["error"])
}

func TestLogger_WithContext(t *testing.T) {
	buf := &bytes.Buffer{}
	cfg := LogConfig{
		Level:       LevelInfo,
		ServiceName: "test-service",
		Environment: "test",
		Pretty:      false,
		Output:      buf,
	}

	logger := NewLogger(cfg)

	ctx := context.Background()
	ctx = WithRequestID(ctx, "req_123")
	ctx = WithUserID(ctx, "usr_456")
	ctx = WithOrgID(ctx, "org_789")
	ctx = WithTraceID(ctx, "trace_abc")

	logger.WithContext(ctx).Info("context logging test")

	var logEntry map[string]interface{}
	err := json.Unmarshal(buf.Bytes(), &logEntry)
	assert.NoError(t, err)

	assert.Equal(t, "req_123", logEntry["request_id"])
	assert.Equal(t, "usr_456", logEntry["user_id"])
	assert.Equal(t, "org_789", logEntry["org_id"])
	assert.Equal(t, "trace_abc", logEntry["trace_id"])
}

func TestLogger_Critical(t *testing.T) {
	buf := &bytes.Buffer{}
	cfg := LogConfig{
		Level:       LevelInfo,
		ServiceName: "test-service",
		Environment: "test",
		Pretty:      false,
		Output:      buf,
	}

	logger := NewLogger(cfg)
	testErr := errors.New("critical failure")
	logger.Critical("system failure", testErr)

	var logEntry map[string]interface{}
	err := json.Unmarshal(buf.Bytes(), &logEntry)
	assert.NoError(t, err)

	assert.Equal(t, "error", logEntry["level"])
	assert.Equal(t, true, logEntry["critical"])
	assert.Equal(t, "critical", logEntry["severity"])
	assert.Equal(t, "critical failure", logEntry["error"])
}

func TestLogger_LogServiceState(t *testing.T) {
	buf := &bytes.Buffer{}
	cfg := LogConfig{
		Level:       LevelInfo,
		ServiceName: "test-service",
		Environment: "test",
		Pretty:      false,
		Output:      buf,
	}

	logger := NewLogger(cfg)
	logger.LogServiceState("running", "start", map[string]interface{}{
		"pid": 12345,
	})

	var logEntry map[string]interface{}
	err := json.Unmarshal(buf.Bytes(), &logEntry)
	assert.NoError(t, err)

	assert.Equal(t, "service_state", logEntry["event_type"])
	assert.Equal(t, "running", logEntry["state"])
	assert.Equal(t, "start", logEntry["action"])
	assert.Equal(t, float64(12345), logEntry["pid"])
}

func TestLogger_LogDatabaseQuery(t *testing.T) {
	buf := &bytes.Buffer{}
	cfg := LogConfig{
		Level:       LevelDebug,
		ServiceName: "test-service",
		Environment: "test",
		Pretty:      false,
		Output:      buf,
	}

	logger := NewLogger(cfg)
	logger.LogDatabaseQuery("SELECT * FROM users", 50*time.Millisecond, nil)

	var logEntry map[string]interface{}
	err := json.Unmarshal(buf.Bytes(), &logEntry)
	assert.NoError(t, err)

	assert.Equal(t, "database_query", logEntry["event_type"])
	assert.Equal(t, "SELECT * FROM users", logEntry["query"])
	assert.Equal(t, true, logEntry["success"])
}

func TestLogger_LogHTTPRequest(t *testing.T) {
	buf := &bytes.Buffer{}
	cfg := LogConfig{
		Level:       LevelInfo,
		ServiceName: "test-service",
		Environment: "test",
		Pretty:      false,
		Output:      buf,
	}

	logger := NewLogger(cfg)
	logger.LogHTTPRequest("GET", "/api/users", 200, 100*time.Millisecond, map[string]interface{}{
		"remote_addr": "192.168.1.1",
	})

	var logEntry map[string]interface{}
	err := json.Unmarshal(buf.Bytes(), &logEntry)
	assert.NoError(t, err)

	assert.Equal(t, "http_request", logEntry["event_type"])
	assert.Equal(t, "GET", logEntry["method"])
	assert.Equal(t, "/api/users", logEntry["path"])
	assert.Equal(t, float64(200), logEntry["status_code"])
	assert.Equal(t, "192.168.1.1", logEntry["remote_addr"])
}

func TestLogger_LogMQEvent(t *testing.T) {
	buf := &bytes.Buffer{}
	cfg := LogConfig{
		Level:       LevelInfo,
		ServiceName: "test-service",
		Environment: "test",
		Pretty:      false,
		Output:      buf,
	}

	logger := NewLogger(cfg)
	logger.LogMQEvent("publish", "build.completed", true, map[string]interface{}{
		"build_id": "bld_123",
	})

	var logEntry map[string]interface{}
	err := json.Unmarshal(buf.Bytes(), &logEntry)
	assert.NoError(t, err)

	assert.Equal(t, "mq_event", logEntry["event_type"])
	assert.Equal(t, "publish", logEntry["mq_event_type"])
	assert.Equal(t, "build.completed", logEntry["topic"])
	assert.Equal(t, true, logEntry["success"])
	assert.Equal(t, "bld_123", logEntry["build_id"])
}

func TestLogger_LogAudit(t *testing.T) {
	buf := &bytes.Buffer{}
	cfg := LogConfig{
		Level:       LevelInfo,
		ServiceName: "test-service",
		Environment: "test",
		Pretty:      false,
		Output:      buf,
	}

	logger := NewLogger(cfg)
	logger.LogAudit("usr_123", "delete", "project", map[string]interface{}{
		"project_id": "prj_456",
	})

	var logEntry map[string]interface{}
	err := json.Unmarshal(buf.Bytes(), &logEntry)
	assert.NoError(t, err)

	assert.Equal(t, "audit", logEntry["event_type"])
	assert.Equal(t, "usr_123", logEntry["actor"])
	assert.Equal(t, "delete", logEntry["action"])
	assert.Equal(t, "project", logEntry["resource"])
	assert.Equal(t, "prj_456", logEntry["project_id"])
}

func TestParseLogLevel(t *testing.T) {
	tests := []struct {
		input    LogLevel
		expected string
	}{
		{LevelDebug, "debug"},
		{LevelInfo, "info"},
		{LevelWarn, "warn"},
		{LevelError, "error"},
		{LevelFatal, "fatal"},
	}

	for _, tt := range tests {
		t.Run(string(tt.input), func(t *testing.T) {
			level := parseLogLevel(tt.input)
			assert.Equal(t, tt.expected, level.String())
		})
	}
}

func TestGlobalLogger(t *testing.T) {
	buf := &bytes.Buffer{}
	InitGlobalLogger(LogConfig{
		Level:       LevelInfo,
		ServiceName: "global-test",
		Environment: "test",
		Pretty:      false,
		Output:      buf,
	})

	Info("global log test")

	var logEntry map[string]interface{}
	err := json.Unmarshal(buf.Bytes(), &logEntry)
	assert.NoError(t, err)

	assert.Equal(t, "global log test", logEntry["message"])
	assert.Equal(t, "global-test", logEntry["service"])
}
