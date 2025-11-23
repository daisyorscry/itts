package lock

import (
    "context"
    "crypto/rand"
    "encoding/hex"
    "errors"
    "time"

    redis "github.com/redis/go-redis/v9"
)

// RedisLocker implements Locker using Redis SET NX with a token + Lua unlock
type RedisLocker struct {
    Client *redis.Client
}

func NewRedisLocker(c *redis.Client) *RedisLocker { return &RedisLocker{Client: c} }

func randToken() (string, error) {
    b := make([]byte, 16)
    if _, err := rand.Read(b); err != nil {
        return "", err
    }
    return hex.EncodeToString(b), nil
}

var unlockScript = redis.NewScript(`
if redis.call('get', KEYS[1]) == ARGV[1] then
  return redis.call('del', KEYS[1])
else
  return 0
end`)

func (l *RedisLocker) WithLock(ctx context.Context, key string, ttl time.Duration, fn func(context.Context) error) error {
    if l.Client == nil {
        return errors.New("redis client is nil")
    }
    token, err := randToken()
    if err != nil {
        return err
    }
    ok, err := l.Client.SetNX(ctx, key, token, ttl).Result()
    if err != nil {
        return err
    }
    if !ok {
        return errors.New("lock is held: " + key)
    }
    defer func() { _ = unlockScript.Run(ctx, l.Client, []string{key}, token).Err() }()
    return fn(ctx)
}

