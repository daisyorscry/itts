package rest

import (
	"context"
	"io"
	"strings"
	"testing"
)

type fakeObjectStorage struct {
	bucket      string
	key         string
	contentType string
	size        int64
	body        []byte
	calls       int
	err         error
}

func (f *fakeObjectStorage) PutObject(_ context.Context, bucket, key, contentType string, body io.Reader, size int64) error {
	f.calls++
	f.bucket = bucket
	f.key = key
	f.contentType = contentType
	f.size = size

	payload, err := io.ReadAll(body)
	if err != nil {
		return err
	}
	f.body = payload

	return f.err
}

func TestUploadEventImageToBucket(t *testing.T) {
	storage := &fakeObjectStorage{}

	err := uploadEventImageToBucket(
		context.Background(),
		storage,
		"itts",
		"/events/test-banner.jpg",
		"image/jpeg",
		strings.NewReader("image-bytes"),
	)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if storage.calls != 1 {
		t.Fatalf("expected PutObject to be called once, got %d", storage.calls)
	}
	if storage.bucket != "itts" {
		t.Fatalf("expected bucket %q, got %q", "itts", storage.bucket)
	}
	if storage.key != "events/test-banner.jpg" {
		t.Fatalf("expected key %q, got %q", "events/test-banner.jpg", storage.key)
	}
	if storage.contentType != "image/jpeg" {
		t.Fatalf("expected content type %q, got %q", "image/jpeg", storage.contentType)
	}
	if storage.size != int64(len("image-bytes")) {
		t.Fatalf("expected size %d, got %d", len("image-bytes"), storage.size)
	}
	if string(storage.body) != "image-bytes" {
		t.Fatalf("expected body %q, got %q", "image-bytes", string(storage.body))
	}
}

func TestUploadEventImageToBucketDefaultsContentType(t *testing.T) {
	storage := &fakeObjectStorage{}

	err := uploadEventImageToBucket(
		context.Background(),
		storage,
		"itts",
		"events/test-banner.webp",
		"",
		strings.NewReader("binary"),
	)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if storage.contentType != "application/octet-stream" {
		t.Fatalf("expected default content type %q, got %q", "application/octet-stream", storage.contentType)
	}
}

func TestUploadEventImageToBucketValidatesInput(t *testing.T) {
	tests := []struct {
		name    string
		bucket  string
		key     string
		storage ObjectStorage
	}{
		{name: "missing storage", bucket: "itts", key: "events/test.jpg", storage: nil},
		{name: "missing bucket", bucket: "", key: "events/test.jpg", storage: &fakeObjectStorage{}},
		{name: "missing key", bucket: "itts", key: "", storage: &fakeObjectStorage{}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := uploadEventImageToBucket(
				context.Background(),
				tt.storage,
				tt.bucket,
				tt.key,
				"image/jpeg",
				strings.NewReader("image-bytes"),
			)
			if err == nil {
				t.Fatal("expected error, got nil")
			}
		})
	}
}
