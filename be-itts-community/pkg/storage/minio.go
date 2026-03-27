package storage

import (
	"context"
	"io"
	"strings"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type MinIOClient struct {
	client *minio.Client
}

func NewMinIOClient(endpoint, accessKey, secretKey string, useSSL bool) (*MinIOClient, error) {
	client, err := minio.New(strings.TrimSpace(endpoint), &minio.Options{
		Creds:  credentials.NewStaticV4(strings.TrimSpace(accessKey), strings.TrimSpace(secretKey), ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, err
	}

	return &MinIOClient{client: client}, nil
}

func (m *MinIOClient) PutObject(ctx context.Context, bucket, key, contentType string, body io.Reader, size int64) error {
	_, err := m.client.PutObject(ctx, bucket, key, body, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	return err
}
