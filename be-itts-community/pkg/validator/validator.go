package validator

import (
	"errors"
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func init() {
	validate = validator.New(validator.WithRequiredStructEnabled())
}

// ValidationError represents a structured validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ValidationErrors is a collection of validation errors
type ValidationErrors []ValidationError

func (v ValidationErrors) Error() string {
	if len(v) == 0 {
		return ""
	}
	var msgs []string
	for _, e := range v {
		msgs = append(msgs, fmt.Sprintf("%s: %s", e.Field, e.Message))
	}
	return strings.Join(msgs, "; ")
}

// Validate validates a struct and returns ValidationErrors if validation fails
func Validate(s any) error {
	if err := validate.Struct(s); err != nil {
		var validationErrs validator.ValidationErrors
		if errors.As(err, &validationErrs) {
			return toValidationErrors(validationErrs)
		}
		return err
	}
	return nil
}

func toValidationErrors(errs validator.ValidationErrors) ValidationErrors {
	result := make(ValidationErrors, 0, len(errs))
	for _, e := range errs {
		result = append(result, ValidationError{
			Field:   toSnakeCase(e.Field()),
			Message: formatMessage(e),
		})
	}
	return result
}

func formatMessage(e validator.FieldError) string {
	switch e.Tag() {
	case "required":
		return "field is required"
	case "email":
		return "must be a valid email address"
	case "min":
		return fmt.Sprintf("must be at least %s characters", e.Param())
	case "max":
		return fmt.Sprintf("must be at most %s characters", e.Param())
	case "gte":
		return fmt.Sprintf("must be greater than or equal to %s", e.Param())
	case "lte":
		return fmt.Sprintf("must be less than or equal to %s", e.Param())
	case "oneof":
		return fmt.Sprintf("must be one of: %s", e.Param())
	case "uuid4":
		return "must be a valid UUID v4"
	case "url":
		return "must be a valid URL"
	default:
		return fmt.Sprintf("failed on '%s' validation", e.Tag())
	}
}

func toSnakeCase(s string) string {
	var result strings.Builder
	for i, r := range s {
		if i > 0 && r >= 'A' && r <= 'Z' {
			result.WriteRune('_')
		}
		result.WriteRune(r)
	}
	return strings.ToLower(result.String())
}

// IsValidationError checks if the error is a ValidationErrors type
func IsValidationError(err error) bool {
	var ve ValidationErrors
	return errors.As(err, &ve)
}

// GetValidationErrors extracts ValidationErrors from error
func GetValidationErrors(err error) (ValidationErrors, bool) {
	var ve ValidationErrors
	if errors.As(err, &ve) {
		return ve, true
	}
	return nil, false
}
