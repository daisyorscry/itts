package core

import (
	"bufio"
	"net"
	"net/http"
	"time"

	"github.com/google/uuid"
)

// responseWriter wraps http.ResponseWriter to capture status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
	written    int64
}

func newResponseWriter(w http.ResponseWriter) *responseWriter {
	return &responseWriter{
		ResponseWriter: w,
		statusCode:     http.StatusOK,
	}
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func (rw *responseWriter) Write(b []byte) (int, error) {
	n, err := rw.ResponseWriter.Write(b)
	rw.written += int64(n)
	return n, err
}

// Hijack implements http.Hijacker interface (required for WebSocket)
func (rw *responseWriter) Hijack() (net.Conn, *bufio.ReadWriter, error) {
	hijacker, ok := rw.ResponseWriter.(http.Hijacker)
	if !ok {
		return nil, nil, http.ErrNotSupported
	}
	return hijacker.Hijack()
}

// Flush implements http.Flusher interface (required for SSE)
func (rw *responseWriter) Flush() {
	if flusher, ok := rw.ResponseWriter.(http.Flusher); ok {
		flusher.Flush()
	}
}

// LoggingMiddleware logs HTTP requests
func LoggingMiddleware(logger *Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()

			// Generate or extract request ID
			requestID := r.Header.Get("X-Request-Id")
			if requestID == "" {
				requestID = "req_" + uuid.New().String()
			}

			// Set request ID in header
			w.Header().Set("X-Request-Id", requestID)

			// Add request ID to context
			ctx := WithRequestID(r.Context(), requestID)
			r = r.WithContext(ctx)

			// Wrap response writer
			rw := newResponseWriter(w)

			// Process request
			next.ServeHTTP(rw, r)

			// Calculate duration
			duration := time.Since(start)

			// Log request
			metadata := map[string]interface{}{
				"remote_addr":  r.RemoteAddr,
				"user_agent":   r.UserAgent(),
				"content_type": r.Header.Get("Content-Type"),
				"bytes_out":    rw.written,
			}

			logger.WithContext(ctx).LogHTTPRequest(
				r.Method,
				r.URL.Path,
				rw.statusCode,
				duration,
				metadata,
			)
		})
	}
}

// RecoveryMiddleware recovers from panics and logs them
func RecoveryMiddleware(logger *Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if err := recover(); err != nil {
					// Log critical error
					logger.WithContext(r.Context()).
						WithField("panic", err).
						WithField("method", r.Method).
						WithField("path", r.URL.Path).
						Critical("Panic recovered in HTTP handler", nil)

					// Return 500 error
					RespondError(w, r, InternalServerError("Terjadi kesalahan internal"))
				}
			}()

			next.ServeHTTP(w, r)
		})
	}
}

// ContextMiddleware adds common context values from headers
func ContextMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()

			// Extract user ID from header (set by auth middleware)
			if userID := r.Header.Get("X-User-Id"); userID != "" {
				ctx = WithUserID(ctx, userID)
			}

			// Extract org ID from header (set by auth middleware)
			if orgID := r.Header.Get("X-Org-Id"); orgID != "" {
				ctx = WithOrgID(ctx, orgID)
			}

			// Extract trace ID from header (for distributed tracing)
			if traceID := r.Header.Get("X-Trace-Id"); traceID != "" {
				ctx = WithTraceID(ctx, traceID)
			}

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
