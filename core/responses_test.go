package core

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetRequestID(t *testing.T) {
	t.Run("with X-Request-Id header", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.Header.Set("X-Request-Id", "req_custom_id")

		id := getRequestID(req)
		assert.Equal(t, "req_custom_id", id)
	})

	t.Run("without X-Request-Id header", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/test", nil)

		id := getRequestID(req)
		assert.NotEmpty(t, id)
		assert.Contains(t, id, "req_")
	})
}

func TestWriteSuccess(t *testing.T) {
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("X-Request-Id", "req_test_123")

	data := map[string]string{"id": "prj_123", "name": "Test Project"}
	WriteSuccess(w, req, http.StatusOK, data)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, "application/json; charset=utf-8", w.Header().Get("Content-Type"))

	var response Success
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)

	assert.Equal(t, "req_test_123", response.Meta.RequestID)
	assert.NotZero(t, response.Meta.Timestamp)

	dataMap, ok := response.Data.(map[string]any)
	assert.True(t, ok)
	assert.Equal(t, "prj_123", dataMap["id"])
	assert.Equal(t, "Test Project", dataMap["name"])
}

func TestWriteList(t *testing.T) {
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("X-Request-Id", "req_list_123")

	data := []any{
		map[string]string{"id": "1", "name": "Project 1"},
		map[string]string{"id": "2", "name": "Project 2"},
	}
	page := map[string]any{"size": 25, "nextCursor": "cursor_123"}

	WriteList(w, req, http.StatusOK, data, page)

	assert.Equal(t, http.StatusOK, w.Code)

	var response List
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)

	assert.Equal(t, "req_list_123", response.Meta.RequestID)
	assert.Len(t, response.Data, 2)
	assert.NotNil(t, response.Page)

	pageMap, ok := response.Page.(map[string]any)
	assert.True(t, ok)
	assert.Equal(t, float64(25), pageMap["size"])
}

func TestWriteError(t *testing.T) {
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("X-Request-Id", "req_error_123")

	details := map[string]any{
		"resource": "project",
		"id":       "prj_999",
	}

	WriteError(w, req, http.StatusNotFound, "NOT_FOUND", "Resource tidak ditemukan", details)

	assert.Equal(t, http.StatusNotFound, w.Code)

	var response ErrorResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)

	assert.Equal(t, "req_error_123", response.Meta.RequestID)
	assert.Equal(t, "NOT_FOUND", response.Error.Code)
	assert.Equal(t, "Resource tidak ditemukan", response.Error.Message)
	assert.Equal(t, "project", response.Error.Details["resource"])
	assert.Equal(t, "prj_999", response.Error.Details["id"])
}

func TestWriteAppError(t *testing.T) {
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("X-Request-Id", "req_app_error_123")

	appErr := NotFound("service", "svc_123")
	WriteAppError(w, req, appErr)

	assert.Equal(t, http.StatusNotFound, w.Code)

	var response ErrorResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)

	assert.Equal(t, "NOT_FOUND", response.Error.Code)
	assert.Equal(t, "Resource tidak ditemukan", response.Error.Message)
	assert.Equal(t, "service", response.Error.Details["resource"])
	assert.Equal(t, "svc_123", response.Error.Details["id"])
}

func TestRespondError(t *testing.T) {
	t.Run("with AppError", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/test", nil)

		err := Unauthorized("Token expired")
		RespondError(w, req, err)

		assert.Equal(t, http.StatusUnauthorized, w.Code)

		var response ErrorResponse
		jsonErr := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, jsonErr)
		assert.Equal(t, "UNAUTHORIZED", response.Error.Code)
	})

	t.Run("with standard error", func(t *testing.T) {
		w := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/test", nil)

		err := errors.New("some random error")
		RespondError(w, req, err)

		assert.Equal(t, http.StatusInternalServerError, w.Code)

		var response ErrorResponse
		jsonErr := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, jsonErr)
		assert.Equal(t, "INTERNAL_SERVER_ERROR", response.Error.Code)
		assert.Equal(t, "Terjadi kesalahan internal", response.Error.Message)
	})
}

func TestOK(t *testing.T) {
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/test", nil)

	data := map[string]string{"status": "success"}
	OK(w, req, data)

	assert.Equal(t, http.StatusOK, w.Code)

	var response Success
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)

	dataMap, ok := response.Data.(map[string]any)
	assert.True(t, ok)
	assert.Equal(t, "success", dataMap["status"])
}

func TestCreated(t *testing.T) {
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/test", nil)

	data := map[string]string{"id": "new_123"}
	Created(w, req, data)

	assert.Equal(t, http.StatusCreated, w.Code)
}

func TestAccepted(t *testing.T) {
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/test", nil)

	data := map[string]string{"jobId": "job_123"}
	Accepted(w, req, data)

	assert.Equal(t, http.StatusAccepted, w.Code)
}

func TestNoContent(t *testing.T) {
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodDelete, "/test", nil)
	req.Header.Set("X-Request-Id", "req_no_content_123")

	NoContent(w, req)

	assert.Equal(t, http.StatusNoContent, w.Code)
	assert.Equal(t, "req_no_content_123", w.Header().Get("X-Request-Id"))
	assert.Empty(t, w.Body.String())
}

func TestWriteJSON(t *testing.T) {
	w := httptest.NewRecorder()

	data := map[string]string{"key": "value"}
	WriteJSON(w, http.StatusOK, data)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, "application/json; charset=utf-8", w.Header().Get("Content-Type"))

	var result map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &result)
	assert.NoError(t, err)
	assert.Equal(t, "value", result["key"])
}
