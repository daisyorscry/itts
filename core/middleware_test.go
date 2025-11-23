package core

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoggingMiddleware(t *testing.T) {
	buf := &bytes.Buffer{}
	logger := NewLogger(LogConfig{
		Level:       LevelInfo,
		ServiceName: "test-service",
		Environment: "test",
		Pretty:      false,
		Output:      buf,
	})

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("test response"))
	})

	middleware := LoggingMiddleware(logger)
	wrapped := middleware(handler)

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()

	wrapped.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.NotEmpty(t, w.Header().Get("X-Request-Id"))
	assert.Contains(t, buf.String(), "http_request")
	assert.Contains(t, buf.String(), "/test")
}

func TestLoggingMiddleware_WithRequestID(t *testing.T) {
	buf := &bytes.Buffer{}
	logger := NewLogger(LogConfig{
		Level:       LevelInfo,
		ServiceName: "test-service",
		Environment: "test",
		Pretty:      false,
		Output:      buf,
	})

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	middleware := LoggingMiddleware(logger)
	wrapped := middleware(handler)

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("X-Request-Id", "req_custom_123")
	w := httptest.NewRecorder()

	wrapped.ServeHTTP(w, req)

	assert.Equal(t, "req_custom_123", w.Header().Get("X-Request-Id"))
	assert.Contains(t, buf.String(), "req_custom_123")
}

func TestRecoveryMiddleware(t *testing.T) {
	buf := &bytes.Buffer{}
	logger := NewLogger(LogConfig{
		Level:       LevelInfo,
		ServiceName: "test-service",
		Environment: "test",
		Pretty:      false,
		Output:      buf,
	})

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		panic("test panic")
	})

	middleware := RecoveryMiddleware(logger)
	wrapped := middleware(handler)

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("X-Request-Id", "req_panic_test")
	w := httptest.NewRecorder()

	wrapped.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	assert.Contains(t, buf.String(), "Panic recovered")
	assert.Contains(t, buf.String(), "critical")
}

func TestContextMiddleware(t *testing.T) {
	var capturedContext *http.Request

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedContext = r
		w.WriteHeader(http.StatusOK)
	})

	middleware := ContextMiddleware()
	wrapped := middleware(handler)

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("X-User-Id", "usr_123")
	req.Header.Set("X-Org-Id", "org_456")
	req.Header.Set("X-Trace-Id", "trace_789")
	w := httptest.NewRecorder()

	wrapped.ServeHTTP(w, req)

	assert.NotNil(t, capturedContext)
	assert.Equal(t, "usr_123", GetUserIDFromContext(capturedContext.Context()))
	assert.Equal(t, "org_456", GetOrgIDFromContext(capturedContext.Context()))
	assert.Equal(t, "trace_789", GetTraceIDFromContext(capturedContext.Context()))
}

func TestResponseWriter_WriteHeader(t *testing.T) {
	w := httptest.NewRecorder()
	rw := newResponseWriter(w)

	rw.WriteHeader(http.StatusCreated)

	assert.Equal(t, http.StatusCreated, rw.statusCode)
}

func TestResponseWriter_Write(t *testing.T) {
	w := httptest.NewRecorder()
	rw := newResponseWriter(w)

	data := []byte("test data")
	n, err := rw.Write(data)

	assert.NoError(t, err)
	assert.Equal(t, len(data), n)
	assert.Equal(t, int64(len(data)), rw.written)
}

func TestResponseWriter_DefaultStatusCode(t *testing.T) {
	w := httptest.NewRecorder()
	rw := newResponseWriter(w)

	assert.Equal(t, http.StatusOK, rw.statusCode)
}
