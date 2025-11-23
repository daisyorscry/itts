package core

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestWithRequestID(t *testing.T) {
	ctx := context.Background()
	ctx = WithRequestID(ctx, "req_123")

	requestID := GetRequestIDFromContext(ctx)
	assert.Equal(t, "req_123", requestID)
}

func TestGetRequestIDFromContext_Empty(t *testing.T) {
	ctx := context.Background()
	requestID := GetRequestIDFromContext(ctx)
	assert.Empty(t, requestID)
}

func TestGetRequestIDFromContext_Nil(t *testing.T) {
	requestID := GetRequestIDFromContext(nil)
	assert.Empty(t, requestID)
}

func TestWithUserID(t *testing.T) {
	ctx := context.Background()
	ctx = WithUserID(ctx, "usr_456")

	userID := GetUserIDFromContext(ctx)
	assert.Equal(t, "usr_456", userID)
}

func TestGetUserIDFromContext_Empty(t *testing.T) {
	ctx := context.Background()
	userID := GetUserIDFromContext(ctx)
	assert.Empty(t, userID)
}

func TestWithOrgID(t *testing.T) {
	ctx := context.Background()
	ctx = WithOrgID(ctx, "org_789")

	orgID := GetOrgIDFromContext(ctx)
	assert.Equal(t, "org_789", orgID)
}

func TestGetOrgIDFromContext_Empty(t *testing.T) {
	ctx := context.Background()
	orgID := GetOrgIDFromContext(ctx)
	assert.Empty(t, orgID)
}

func TestWithTraceID(t *testing.T) {
	ctx := context.Background()
	ctx = WithTraceID(ctx, "trace_abc")

	traceID := GetTraceIDFromContext(ctx)
	assert.Equal(t, "trace_abc", traceID)
}

func TestGetTraceIDFromContext_Empty(t *testing.T) {
	ctx := context.Background()
	traceID := GetTraceIDFromContext(ctx)
	assert.Empty(t, traceID)
}

func TestMultipleContextValues(t *testing.T) {
	ctx := context.Background()
	ctx = WithRequestID(ctx, "req_123")
	ctx = WithUserID(ctx, "usr_456")
	ctx = WithOrgID(ctx, "org_789")
	ctx = WithTraceID(ctx, "trace_abc")

	assert.Equal(t, "req_123", GetRequestIDFromContext(ctx))
	assert.Equal(t, "usr_456", GetUserIDFromContext(ctx))
	assert.Equal(t, "org_789", GetOrgIDFromContext(ctx))
	assert.Equal(t, "trace_abc", GetTraceIDFromContext(ctx))
}
