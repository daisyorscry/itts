package rest

import (
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/daisyorscry/itts/core"
)

const (
	maxUploadSize = 5 << 20
	uploadBaseDir = "./uploads/events"
)

type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
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

	if err := os.MkdirAll(uploadBaseDir, 0o755); err != nil {
		core.WriteAppError(w, r, core.InternalServerError("failed to prepare upload directory").WithError(err))
		return
	}

	filename := buildUploadFilename(header.Filename)
	targetPath := filepath.Join(uploadBaseDir, filename)
	dst, err := os.Create(targetPath)
	if err != nil {
		core.WriteAppError(w, r, core.InternalServerError("failed to create upload target").WithError(err))
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		core.WriteAppError(w, r, core.InternalServerError("failed to write upload file").WithError(err))
		return
	}

	core.OK(w, r, map[string]string{
		"file_path": "/uploads/events/" + filename,
		"image_url": buildAbsoluteAssetURL(r, "/uploads/events/"+filename),
	})
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
