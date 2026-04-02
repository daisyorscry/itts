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

type uploadKind struct {
	directory       string
	defaultBaseName string
	validator       func(*multipart.FileHeader) bool
}

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
	h.uploadAsset(w, r, uploadKind{
		directory:       "events",
		defaultBaseName: "event",
		validator:       isAllowedImage,
	}, "only image uploads are allowed", "image_url")
}

func (h *UploadHandler) UploadLearningFile(w http.ResponseWriter, r *http.Request) {
	h.uploadAsset(w, r, uploadKind{
		directory:       "learning/files",
		defaultBaseName: "learning-file",
		validator:       isAllowedFile,
	}, "invalid attachment file", "file_url")
}

func (h *UploadHandler) UploadLearningVideo(w http.ResponseWriter, r *http.Request) {
	h.uploadAsset(w, r, uploadKind{
		directory:       "learning/videos",
		defaultBaseName: "learning-video",
		validator:       isAllowedVideo,
	}, "only video uploads are allowed", "file_url")
}

func (h *UploadHandler) uploadAsset(w http.ResponseWriter, r *http.Request, kind uploadKind, invalidTypeMessage, responseURLKey string) {
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

	if kind.validator != nil && !kind.validator(header) {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_FILE_TYPE", invalidTypeMessage, nil)
		return
	}

	if h.storage == nil {
		core.WriteAppError(w, r, core.InternalServerError("object storage is not configured"))
		return
	}

	filename := buildUploadFilename(header.Filename, kind.defaultBaseName)
	objectKey := filepath.ToSlash(filepath.Join(kind.directory, filename))
	contentType := strings.TrimSpace(header.Header.Get("Content-Type"))
	payload, err := readUploadedFile(file)
	if err != nil {
		core.WriteAppError(w, r, core.InternalServerError("failed to read upload file").WithError(err))
		return
	}

	if err := uploadAssetToBucket(context.Background(), h.storage, h.bucket, objectKey, contentType, bytes.NewReader(payload)); err != nil {
		core.WriteAppError(w, r, core.InternalServerError("failed to upload file to object storage").WithError(err))
		return
	}

	filePath := "/" + objectKey
	response := map[string]string{
		"file_path":    filePath,
		responseURLKey: buildAbsoluteAssetURL(r, filePath),
	}
	if responseURLKey != "image_url" {
		response["image_url"] = response[responseURLKey]
	}
	core.OK(w, r, response)
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

func isAllowedFile(header *multipart.FileHeader) bool {
	return strings.TrimSpace(header.Filename) != ""
}

func isAllowedVideo(header *multipart.FileHeader) bool {
	contentType := strings.ToLower(strings.TrimSpace(header.Header.Get("Content-Type")))
	if strings.HasPrefix(contentType, "video/") {
		return true
	}

	ext := strings.ToLower(filepath.Ext(header.Filename))
	switch ext {
	case ".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv":
		return true
	default:
		return false
	}
}

func buildUploadFilename(originalName, fallbackBaseName string) string {
	ext := strings.ToLower(filepath.Ext(originalName))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".webp", ".gif":
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
		safeName = fallbackBaseName
	}
	if ext == "" {
		ext = ".bin"
	}

	return safeName + "-" + time.Now().Format("20060102150405.000000000") + ext
}
