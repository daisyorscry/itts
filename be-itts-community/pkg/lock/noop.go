package lock

import (
    "context"
    "time"
)

type noopLocker struct{}

// NewNoopLocker returns a Locker that does nothing (for local/dev or tests)
func NewNoopLocker() Locker { return &noopLocker{} }

func (l *noopLocker) WithLock(ctx context.Context, key string, ttl time.Duration, fn func(context.Context) error) error {
    return fn(ctx)
}

