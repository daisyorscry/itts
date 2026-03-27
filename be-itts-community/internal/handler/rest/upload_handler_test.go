package rest

import (
	"bytes"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestUploadEventImageUploadsToObjectStorage(t *testing.T) {
	t.Setenv("ASSET_BASE_URL", "https://storage.itts.fun")
	t.Setenv("ASSET_BUCKET", "itts")

	storage := &fakeObjectStorage{}
	handler := NewUploadHandler(storage, "itts")

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	fileWriter, err := writer.CreateFormFile("file", "banner.jpg")
	if err != nil {
		t.Fatalf("create form file: %v", err)
	}
	if _, err := fileWriter.Write([]byte("image-bytes")); err != nil {
		t.Fatalf("write form file: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("close multipart writer: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/uploads/images", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	rec := httptest.NewRecorder()
	handler.UploadEventImage(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d, body=%s", http.StatusOK, rec.Code, rec.Body.String())
	}

	if storage.calls != 1 {
		t.Fatalf("expected PutObject to be called once, got %d", storage.calls)
	}
	if storage.bucket != "itts" {
		t.Fatalf("expected bucket %q, got %q", "itts", storage.bucket)
	}
	if !strings.HasPrefix(storage.key, "events/banner-") || !strings.HasSuffix(storage.key, ".jpg") {
		t.Fatalf("unexpected object key %q", storage.key)
	}
	if storage.contentType == "" {
		t.Fatal("expected content type to be forwarded")
	}
	if string(storage.body) != "image-bytes" {
		t.Fatalf("expected uploaded body %q, got %q", "image-bytes", string(storage.body))
	}

	var response struct {
		Data map[string]string `json:"data"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	filePath := response.Data["file_path"]
	imageURL := response.Data["image_url"]
	if !strings.HasPrefix(filePath, "/events/banner-") || !strings.HasSuffix(filePath, ".jpg") {
		t.Fatalf("unexpected file_path %q", filePath)
	}
	if imageURL != "https://storage.itts.fun/itts"+filePath {
		t.Fatalf("expected image_url to point to storage bucket, got %q", imageURL)
	}
}
