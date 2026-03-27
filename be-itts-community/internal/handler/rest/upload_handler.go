package rest

import (
	"bytes"
	"context"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/daisyorscry/itts/core"
)

const (
	maxUploadSize = 5 << 20
)

type UploadHandler struct {
	storage ObjectStorage
	bucket  string
}

func NewUploadHandler(storage ObjectStorage, bucket string) *UploadHandler {
	return &UploadHandler{
		storage: storage,
		bucket:  strings.TrimSpace(bucket),
	}
}

func (h *UploadHandler) UploadEventImage(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)

	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_MULTIPART", "invalid upload payload", nil)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "FILE_REQUIRED", "file is required", nil)
		return
	}
	defer file.Close()

	if !isAllowedImage(header) {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_FILE_TYPE", "only image uploads are allowed", nil)
		return
	}

	if h.storage == nil {
		core.WriteAppError(w, r, core.InternalServerError("object storage is not configured"))
		return
	}

	filename := buildUploadFilename(header.Filename)
	objectKey := filepath.ToSlash(filepath.Join("events", filename))
	contentType := strings.TrimSpace(header.Header.Get("Content-Type"))
	payload, err := readUploadedFile(file)
	if err != nil {
		core.WriteAppError(w, r, core.InternalServerError("failed to read upload file").WithError(err))
		return
	}

	if err := uploadEventImageToBucket(context.Background(), h.storage, h.bucket, objectKey, contentType, bytes.NewReader(payload)); err != nil {
		core.WriteAppError(w, r, core.InternalServerError("failed to upload image to object storage").WithError(err))
		return
	}

	filePath := "/" + objectKey
	core.OK(w, r, map[string]string{
		"file_path": filePath,
		"image_url": buildAbsoluteAssetURL(r, filePath),
	})
}

func readUploadedFile(file multipart.File) ([]byte, error) {
	return io.ReadAll(file)
}

func isAllowedImage(header *multipart.FileHeader) bool {
	contentType := strings.ToLower(strings.TrimSpace(header.Header.Get("Content-Type")))
	if strings.HasPrefix(contentType, "image/") {
		return true
	}

	ext := strings.ToLower(filepath.Ext(header.Filename))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".webp", ".gif":
		return true
	default:
		return false
	}
}

func buildUploadFilename(originalName string) string {
	ext := strings.ToLower(filepath.Ext(originalName))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".webp", ".gif":
	default:
		ext = ".bin"
	}

	safeName := strings.TrimSuffix(filepath.Base(originalName), filepath.Ext(originalName))
	safeName = strings.ToLower(strings.TrimSpace(safeName))
	safeName = strings.ReplaceAll(safeName, " ", "-")
	safeName = strings.Map(func(r rune) rune {
		switch {
		case r >= 'a' && r <= 'z':
			return r
		case r >= '0' && r <= '9':
			return r
		case r == '-':
			return r
		default:
			return -1
		}
	}, safeName)
	if safeName == "" {
		safeName = "event"
	}

	return safeName + "-" + time.Now().Format("20060102150405.000000000") + ext
}
