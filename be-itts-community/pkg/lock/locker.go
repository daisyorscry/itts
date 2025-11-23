package lock

import (
    "context"
    "time"
)

// Locker provides distributed lock semantics
type Locker interface {
    // WithLock acquires a lock for the given key and TTL, executes fn, then releases the lock.
    // If the lock cannot be acquired, returns an error.
    WithLock(ctx context.Context, key string, ttl time.Duration, fn func(context.Context) error) error
}

