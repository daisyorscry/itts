package core

import "context"

// Context keys for logging
type contextKey string

const (
	contextKeyRequestID contextKey = "request_id"
	contextKeyUserID    contextKey = "user_id"
	contextKeyOrgID     contextKey = "org_id"
	contextKeyTraceID   contextKey = "trace_id"
)

// Context helpers for request tracking

// WithRequestID adds request ID to context
func WithRequestID(ctx context.Context, requestID string) context.Context {
	return context.WithValue(ctx, contextKeyRequestID, requestID)
}

// GetRequestIDFromContext extracts request ID from context
func GetRequestIDFromContext(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	if requestID, ok := ctx.Value(contextKeyRequestID).(string); ok {
		return requestID
	}
	return ""
}

// WithUserID adds user ID to context
func WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, contextKeyUserID, userID)
}

// GetUserIDFromContext extracts user ID from context
func GetUserIDFromContext(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	if userID, ok := ctx.Value(contextKeyUserID).(string); ok {
		return userID
	}
	return ""
}

// WithOrgID adds organization ID to context
func WithOrgID(ctx context.Context, orgID string) context.Context {
	return context.WithValue(ctx, contextKeyOrgID, orgID)
}

// GetOrgIDFromContext extracts organization ID from context
func GetOrgIDFromContext(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	if orgID, ok := ctx.Value(contextKeyOrgID).(string); ok {
		return orgID
	}
	return ""
}

// WithTraceID adds trace ID to context (for distributed tracing)
func WithTraceID(ctx context.Context, traceID string) context.Context {
	return context.WithValue(ctx, contextKeyTraceID, traceID)
}

// GetTraceIDFromContext extracts trace ID from context
func GetTraceIDFromContext(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	if traceID, ok := ctx.Value(contextKeyTraceID).(string); ok {
		return traceID
	}
	return ""
}
