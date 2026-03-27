package rest

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"strings"
)

type ObjectStorage interface {
	PutObject(ctx context.Context, bucket, key, contentType string, body io.Reader, size int64) error
}

func uploadEventImageToBucket(ctx context.Context, storage ObjectStorage, bucket, key, contentType string, file io.Reader) error {
	if storage == nil {
		return fmt.Errorf("object storage is required")
	}

	bucket = strings.TrimSpace(bucket)
	if bucket == "" {
		return fmt.Errorf("bucket is required")
	}

	key = strings.TrimLeft(strings.TrimSpace(key), "/")
	if key == "" {
		return fmt.Errorf("object key is required")
	}

	contentType = strings.TrimSpace(contentType)
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	payload, err := io.ReadAll(file)
	if err != nil {
		return fmt.Errorf("read upload payload: %w", err)
	}

	if err := storage.PutObject(ctx, bucket, key, contentType, bytes.NewReader(payload), int64(len(payload))); err != nil {
		return fmt.Errorf("put object: %w", err)
	}

	return nil
}
