package core

import (
	"encoding/json"
	"net/http"
	"time"
)

type Meta struct {
	RequestID string    `json:"requestId"`
	Timestamp time.Time `json:"timestamp"`
}

type Success struct {
	Data any  `json:"data"`
	Meta Meta `json:"meta"`
}

type List struct {
	Data []any `json:"data"`
	Page any   `json:"page,omitempty"`
	Meta Meta  `json:"meta"`
}

type ErrorResponse struct {
	Error ErrorBody `json:"error"`
	Meta  Meta      `json:"meta"`
}

type ErrorBody struct {
	Code    string         `json:"code"`
	Message string         `json:"message"`
	Details map[string]any `json:"details,omitempty"`
}

func getRequestID(r *http.Request) string {
	id := r.Header.Get("X-Request-Id")
	if id == "" {
		id = "req_" + time.Now().Format("20060102150405")
	}
	return id
}

func WriteJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// WriteSuccess writes success response with data
func WriteSuccess(w http.ResponseWriter, r *http.Request, status int, data any) {
	resp := Success{
		Data: data,
		Meta: Meta{
			RequestID: getRequestID(r),
			Timestamp: time.Now().UTC(),
		},
	}
	WriteJSON(w, status, resp)
}

// WriteList writes success response with list data and pagination
func WriteList(w http.ResponseWriter, r *http.Request, status int, data []any, page any) {
	resp := List{
		Data: data,
		Page: page,
		Meta: Meta{
			RequestID: getRequestID(r),
			Timestamp: time.Now().UTC(),
		},
	}
	WriteJSON(w, status, resp)
}

// WriteError writes error response
func WriteError(w http.ResponseWriter, r *http.Request, status int, code, message string, details map[string]any) {
	resp := ErrorResponse{
		Error: ErrorBody{
			Code:    code,
			Message: message,
			Details: details,
		},
		Meta: Meta{
			RequestID: getRequestID(r),
			Timestamp: time.Now().UTC(),
		},
	}
	WriteJSON(w, status, resp)
}

// WriteAppError writes error response from AppError
func WriteAppError(w http.ResponseWriter, r *http.Request, err *AppError) {
	WriteError(w, r, err.HTTPStatus, err.Code, err.Message, err.Details)
}

// RespondError handles error response - checks if error is AppError, otherwise returns 500
func RespondError(w http.ResponseWriter, r *http.Request, err error) {
	if appErr, ok := IsAppError(err); ok {
		WriteAppError(w, r, appErr)
		return
	}

	// Fallback to internal server error
	WriteError(w, r, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Terjadi kesalahan internal", nil)
}

// Common response helpers
func OK(w http.ResponseWriter, r *http.Request, data any) {
	WriteSuccess(w, r, http.StatusOK, data)
}

func Created(w http.ResponseWriter, r *http.Request, data any) {
	WriteSuccess(w, r, http.StatusCreated, data)
}

func Accepted(w http.ResponseWriter, r *http.Request, data any) {
	WriteSuccess(w, r, http.StatusAccepted, data)
}

func NoContent(w http.ResponseWriter, r *http.Request) {
	requestID := getRequestID(r)
	w.Header().Set("X-Request-Id", requestID)
	w.WriteHeader(http.StatusNoContent)
}
