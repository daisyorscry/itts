package rest

import (
	"net/http"
	"os"
	"strings"
)

const defaultAssetBaseURL = "https://storage.itts.fun"
const defaultAssetBucket = "itts"

func buildAbsoluteAssetURL(_ *http.Request, path string) string {
	if path == "" {
		return ""
	}
	if !isAssetPath(path) {
		return path
	}

	baseURL := strings.TrimRight(strings.TrimSpace(os.Getenv("ASSET_BASE_URL")), "/")
	if baseURL == "" {
		baseURL = defaultAssetBaseURL
	}
	bucket := strings.Trim(strings.TrimSpace(os.Getenv("ASSET_BUCKET")), "/")
	if bucket == "" {
		bucket = defaultAssetBucket
	}
	baseURL = baseURL + "/" + bucket

	if strings.HasPrefix(path, "/") {
		return baseURL + path
	}
	return baseURL + "/" + path
}

func isAssetPath(value string) bool {
	return value != "" && !strings.HasPrefix(value, "http://") && !strings.HasPrefix(value, "https://")
}
