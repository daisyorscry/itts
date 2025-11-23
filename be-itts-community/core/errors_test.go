package core

import (
	"errors"
	"net/http"
	"testing"

	"github.com/go-playground/validator/v10"
	"github.com/stretchr/testify/assert"
)

func TestNewAppError(t *testing.T) {
	err := NewAppError(http.StatusNotFound, "NOT_FOUND", "Resource not found")

	assert.Equal(t, http.StatusNotFound, err.HTTPStatus)
	assert.Equal(t, "NOT_FOUND", err.Code)
	assert.Equal(t, "Resource not found", err.Message)
	assert.NotNil(t, err.Details)
	assert.Empty(t, err.Details)
}

func TestAppError_WithDetail(t *testing.T) {
	err := NewAppError(http.StatusNotFound, "NOT_FOUND", "Resource not found").
		WithDetail("resource", "project").
		WithDetail("id", "123")

	assert.Equal(t, "project", err.Details["resource"])
	assert.Equal(t, "123", err.Details["id"])
}

func TestAppError_WithDetails(t *testing.T) {
	err := NewAppError(http.StatusBadRequest, "BAD_REQUEST", "Invalid request").
		WithDetails(map[string]any{
			"field":  "name",
			"reason": "required",
		})

	assert.Equal(t, "name", err.Details["field"])
	assert.Equal(t, "required", err.Details["reason"])
}

func TestAppError_WithError(t *testing.T) {
	underlying := errors.New("database connection failed")
	err := InternalServerError("Database error").WithError(underlying)

	assert.Equal(t, underlying, err.Err)
	assert.Contains(t, err.Error(), "database connection failed")
}

func TestAppError_Error(t *testing.T) {
	t.Run("without underlying error", func(t *testing.T) {
		err := NotFound("project", "123")
		expected := "[NOT_FOUND] Resource tidak ditemukan"
		assert.Equal(t, expected, err.Error())
	})

	t.Run("with underlying error", func(t *testing.T) {
		underlying := errors.New("connection timeout")
		err := InternalServerError("Database error").WithError(underlying)
		assert.Contains(t, err.Error(), "INTERNAL_SERVER_ERROR")
		assert.Contains(t, err.Error(), "Database error")
		assert.Contains(t, err.Error(), "connection timeout")
	})
}

func TestCommonErrorConstructors(t *testing.T) {
	tests := []struct {
		name       string
		fn         func() *AppError
		wantStatus int
		wantCode   string
	}{
		{
			name:       "BadRequest",
			fn:         func() *AppError { return BadRequest("invalid input") },
			wantStatus: http.StatusBadRequest,
			wantCode:   "BAD_REQUEST",
		},
		{
			name:       "Unauthorized",
			fn:         func() *AppError { return Unauthorized("token expired") },
			wantStatus: http.StatusUnauthorized,
			wantCode:   "UNAUTHORIZED",
		},
		{
			name:       "Forbidden",
			fn:         func() *AppError { return Forbidden("access denied") },
			wantStatus: http.StatusForbidden,
			wantCode:   "FORBIDDEN",
		},
		{
			name:       "NotFound",
			fn:         func() *AppError { return NotFound("service", "svc_123") },
			wantStatus: http.StatusNotFound,
			wantCode:   "NOT_FOUND",
		},
		{
			name:       "Conflict",
			fn:         func() *AppError { return Conflict("resource exists") },
			wantStatus: http.StatusConflict,
			wantCode:   "CONFLICT",
		},
		{
			name:       "UnprocessableEntity",
			fn:         func() *AppError { return UnprocessableEntity("invalid data") },
			wantStatus: http.StatusUnprocessableEntity,
			wantCode:   "UNPROCESSABLE_ENTITY",
		},
		{
			name:       "InternalServerError",
			fn:         func() *AppError { return InternalServerError("internal error") },
			wantStatus: http.StatusInternalServerError,
			wantCode:   "INTERNAL_SERVER_ERROR",
		},
		{
			name:       "ServiceUnavailable",
			fn:         func() *AppError { return ServiceUnavailable("service down") },
			wantStatus: http.StatusServiceUnavailable,
			wantCode:   "SERVICE_UNAVAILABLE",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.fn()
			assert.Equal(t, tt.wantStatus, err.HTTPStatus)
			assert.Equal(t, tt.wantCode, err.Code)
		})
	}
}

func TestNotFound_WithDetails(t *testing.T) {
	err := NotFound("project", "prj_123")

	assert.Equal(t, http.StatusNotFound, err.HTTPStatus)
	assert.Equal(t, "NOT_FOUND", err.Code)
	assert.Equal(t, "project", err.Details["resource"])
	assert.Equal(t, "prj_123", err.Details["id"])
}

func TestValidationError(t *testing.T) {
	type TestRequest struct {
		Name  string `validate:"required,min=3"`
		Email string `validate:"required,email"`
	}

	v := validator.New()
	req := TestRequest{
		Name:  "ab",
		Email: "invalid-email",
	}

	validationErr := v.Struct(req)
	appErr := ValidationError(validationErr)

	assert.Equal(t, http.StatusUnprocessableEntity, appErr.HTTPStatus)
	assert.Equal(t, "VALIDATION_ERROR", appErr.Code)
	assert.Equal(t, "Payload tidak valid", appErr.Message)
	assert.NotNil(t, appErr.Details["fields"])

	fields, ok := appErr.Details["fields"].(FieldErrors)
	assert.True(t, ok)
	assert.NotEmpty(t, fields)
}

func TestIsAppError(t *testing.T) {
	t.Run("is AppError", func(t *testing.T) {
		err := NotFound("project", "123")
		appErr, ok := IsAppError(err)

		assert.True(t, ok)
		assert.NotNil(t, appErr)
		assert.Equal(t, "NOT_FOUND", appErr.Code)
	})

	t.Run("is not AppError", func(t *testing.T) {
		err := errors.New("standard error")
		appErr, ok := IsAppError(err)

		assert.False(t, ok)
		assert.Nil(t, appErr)
	})

	t.Run("wrapped AppError", func(t *testing.T) {
		err := NotFound("project", "123")
		wrapped := errors.Join(err, errors.New("additional context"))

		appErr, ok := IsAppError(wrapped)
		assert.True(t, ok)
		assert.NotNil(t, appErr)
	})
}

func TestAppError_Unwrap(t *testing.T) {
	underlying := errors.New("database error")
	err := InternalServerError("Failed to query").WithError(underlying)

	unwrapped := errors.Unwrap(err)
	assert.Equal(t, underlying, unwrapped)
}

func TestParseValidationErrors(t *testing.T) {
	type TestStruct struct {
		Name  string `json:"name" validate:"required,min=3"`
		Email string `json:"email" validate:"required,email"`
		Age   int    `json:"age" validate:"gte=0,lte=150"`
	}

	v := validator.New()
	data := TestStruct{
		Name:  "ab",
		Email: "not-email",
		Age:   200,
	}

	err := v.Struct(data)
	fieldErrors := ParseValidationErrors(err)

	assert.NotEmpty(t, fieldErrors)
	assert.Contains(t, fieldErrors, "name")
	assert.Contains(t, fieldErrors, "email")
	assert.Contains(t, fieldErrors, "age")
}

func TestParseValidationErrors_Nil(t *testing.T) {
	fieldErrors := ParseValidationErrors(nil)
	assert.Empty(t, fieldErrors)
}
