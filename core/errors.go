package core

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

// AppError represents application error with HTTP status code, error code, message, and details
type AppError struct {
	HTTPStatus int            // HTTP status code
	Code       string         // Error code untuk client
	Message    string         // Human-readable message
	Details    map[string]any // Additional error details
	Err        error          // Underlying error (tidak di-expose ke client)
}

// Error implements error interface
func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("[%s] %s: %v", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

// Unwrap implements errors unwrapper
func (e *AppError) Unwrap() error {
	return e.Err
}

// NewAppError creates a new application error
func NewAppError(httpStatus int, code, message string) *AppError {
	return &AppError{
		HTTPStatus: httpStatus,
		Code:       code,
		Message:    message,
		Details:    make(map[string]any),
	}
}

// WithDetails adds details to the error
func (e *AppError) WithDetails(details map[string]any) *AppError {
	e.Details = details
	return e
}

// WithDetail adds a single detail to the error
func (e *AppError) WithDetail(key string, value any) *AppError {
	if e.Details == nil {
		e.Details = make(map[string]any)
	}
	e.Details[key] = value
	return e
}

// WithError wraps underlying error
func (e *AppError) WithError(err error) *AppError {
	e.Err = err
	return e
}

// Common error constructors
func BadRequest(message string) *AppError {
	return NewAppError(http.StatusBadRequest, "BAD_REQUEST", message)
}

func Unauthorized(message string) *AppError {
	return NewAppError(http.StatusUnauthorized, "UNAUTHORIZED", message)
}

func Forbidden(message string) *AppError {
	return NewAppError(http.StatusForbidden, "FORBIDDEN", message)
}

func NotFound(resource, id string) *AppError {
	return NewAppError(http.StatusNotFound, "NOT_FOUND", "Resource tidak ditemukan").
		WithDetail("resource", resource).
		WithDetail("id", id)
}

func Conflict(message string) *AppError {
	return NewAppError(http.StatusConflict, "CONFLICT", message)
}

func UnprocessableEntity(message string) *AppError {
	return NewAppError(http.StatusUnprocessableEntity, "UNPROCESSABLE_ENTITY", message)
}

func InternalServerError(message string) *AppError {
	return NewAppError(http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", message)
}

func ServiceUnavailable(message string) *AppError {
	return NewAppError(http.StatusServiceUnavailable, "SERVICE_UNAVAILABLE", message)
}

// ValidationError creates validation error from validator errors
func ValidationError(err error) *AppError {
	fieldErrors := ParseValidationErrors(err)
	return NewAppError(http.StatusUnprocessableEntity, "VALIDATION_ERROR", "Payload tidak valid").
		WithDetail("fields", fieldErrors)
}

// IsAppError checks if error is AppError
func IsAppError(err error) (*AppError, bool) {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr, true
	}
	return nil, false
}

type FieldErrors map[string]string

type ErrorDetail struct {
	Detail error `json:"-"`
}

func Wrap(err error) *ErrorDetail {
	if err == nil {
		return nil
	}
	return &ErrorDetail{Detail: err}
}

func (e *ErrorDetail) MarshalJSON() ([]byte, error) {
	if e == nil || e.Detail == nil {
		return []byte(`"null"`), nil
	}
	escaped := strings.ReplaceAll(e.Detail.Error(), `"`, `\"`)
	return []byte(`"` + escaped + `"`), nil
}

func NewErrorDetail(err error) *ErrorDetail {
	if err == nil {
		return nil
	}
	return &ErrorDetail{Detail: err}
}

var defaultTemplates = map[string]string{
	// Common
	"required": "{field} is required",
	"email":    "{field} must be a valid email address",
	"min":      "{field} must be at least {param} characters",
	"max":      "{field} must be at most {param} characters",
	"len":      "{field} must be exactly {param} characters",
	"eq":       "{field} must be equal to {param}",
	"ne":       "{field} must not be equal to {param}",
	"gt":       "{field} must be greater than {param}",
	"gte":      "{field} must be greater than or equal to {param}",
	"lt":       "{field} must be less than {param}",
	"lte":      "{field} must be less than or equal to {param}",
	"eqfield":  "{field} must be equal to {param}",
	"nefield":  "{field} must not be equal to {param}",
	"oneof":    "{field} must be one of: {param}",

	// String
	"alpha":           "{field} must contain only letters",
	"alphanum":        "{field} must contain only letters and numbers",
	"alphanumunicode": "{field} must contain only letters and numbers (unicode)",
	"ascii":           "{field} must contain only ASCII characters",
	"boolean":         "{field} must be a boolean value",
	"contains":        "{field} must contain '{param}'",
	"containsany":     "{field} must contain any of '{param}'",
	"excludes":        "{field} must not contain '{param}'",
	"lowercase":       "{field} must be all lowercase",
	"uppercase":       "{field} must be all uppercase",
	"startswith":      "{field} must start with '{param}'",
	"endswith":        "{field} must end with '{param}'",

	// Format
	"uuid":        "{field} must be a valid UUID",
	"uuid4":       "{field} must be a valid UUIDv4",
	"datetime":    "{field} must be a valid datetime",
	"json":        "{field} must be valid JSON",
	"credit_card": "{field} must be a valid credit card number",
	"base64":      "{field} must be a valid base64 string",
	"e164":        "{field} must be a valid E.164 phone number",
	"url":         "{field} must be a valid URL",
	"http_url":    "{field} must be a valid HTTP(S) URL",
	"ip":          "{field} must be a valid IP address",
	"ipv4":        "{field} must be a valid IPv4 address",
	"ipv6":        "{field} must be a valid IPv6 address",
	"mac":         "{field} must be a valid MAC address",

	// File / System
	"file":  "{field} must be a valid file",
	"dir":   "{field} must be a valid directory",
	"image": "{field} must be an image file",

	// Special
	"isdefault":   "{field} must be default value",
	"excluded_if": "{field} must not be set when condition is met",
	"unique":      "{field} must be unique",
}

func ParseValidationErrors(err error) FieldErrors {
	errors := FieldErrors{}
	if err == nil {
		return errors
	}

	if ve, ok := err.(validator.ValidationErrors); ok {
		for _, fe := range ve {
			field := getJSONFieldName(fe)
			tag := fe.Tag()
			param := fe.Param()
			template := defaultTemplates[tag]

			// fallback message
			if template == "" {
				if param != "" {
					template = "{field} failed on rule '" + tag + "' with param '" + param + "'"
				} else {
					template = "{field} failed on rule '" + tag + "'"
				}
			}

			msg := strings.ReplaceAll(template, "{field}", humanizeFieldName(field))
			msg = strings.ReplaceAll(msg, "{param}", param)

			errors[field] = msg
		}
	}
	return errors
}

func getJSONFieldName(fe validator.FieldError) string {
	// Use StructField() to get the field name from the validator
	// This returns the actual field name from the struct
	fieldName := fe.StructField()

	// Convert to snake_case for JSON field name
	// If the struct has json tags, those should be used in production code
	// For now, we'll use the field name directly
	return strings.ToLower(fieldName)
}

var titleCaser = cases.Title(language.English)

func humanizeFieldName(name string) string {
	parts := strings.Split(name, "_")
	for i, p := range parts {
		parts[i] = titleCaser.String(p)
	}
	return strings.Join(parts, " ")
}
