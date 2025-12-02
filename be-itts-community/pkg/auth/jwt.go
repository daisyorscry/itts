package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrInvalidToken     = errors.New("invalid token")
	ErrExpiredToken     = errors.New("token has expired")
	ErrInvalidSignature = errors.New("invalid token signature")
)

// JWTManager handles JWT token generation and validation
type JWTManager struct {
	secretKey            []byte
	accessTokenDuration  time.Duration
	refreshTokenDuration time.Duration
	issuer               string
}

// Claims represents JWT claims
type Claims struct {
	UserID       string   `json:"user_id"`
	Email        string   `json:"email"`
	IsSuperAdmin bool     `json:"is_super_admin"`
	Roles        []string `json:"roles"`
	Permissions  []string `json:"permissions"`
	jwt.RegisteredClaims
}

// NewJWTManager creates a new JWT manager
func NewJWTManager(
	secretKey string,
	accessTokenDuration time.Duration,
	refreshTokenDuration time.Duration,
	issuer string,
) *JWTManager {
	return &JWTManager{
		secretKey:            []byte(secretKey),
		accessTokenDuration:  accessTokenDuration,
		refreshTokenDuration: refreshTokenDuration,
		issuer:               issuer,
	}
}

// GenerateAccessToken generates a new access token
func (m *JWTManager) GenerateAccessToken(
	userID string,
	email string,
	isSuperAdmin bool,
	roles []string,
	permissions []string,
) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID:       userID,
		Email:        email,
		IsSuperAdmin: isSuperAdmin,
		Roles:        roles,
		Permissions:  permissions,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    m.issuer,
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(m.accessTokenDuration)),
			NotBefore: jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(m.secretKey)
}

// VerifyAccessToken verifies and parses an access token
func (m *JWTManager) VerifyAccessToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(
		tokenString,
		&Claims{},
		func(token *jwt.Token) (interface{}, error) {
			// Verify signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("%w: unexpected signing method %v", ErrInvalidSignature, token.Header["alg"])
			}
			return m.secretKey, nil
		},
	)

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, fmt.Errorf("%w: %v", ErrInvalidToken, err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// GenerateRefreshToken generates a random refresh token
func (m *JWTManager) GenerateRefreshToken() (string, error) {
	token := make([]byte, 32)
	if _, err := rand.Read(token); err != nil {
		return "", fmt.Errorf("failed to generate refresh token: %w", err)
	}
	return hex.EncodeToString(token), nil
}

// HashRefreshToken creates a SHA-256 hash of the refresh token for storage
func (m *JWTManager) HashRefreshToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

// GetAccessTokenDuration returns the access token duration
func (m *JWTManager) GetAccessTokenDuration() time.Duration {
	return m.accessTokenDuration
}

// GetRefreshTokenDuration returns the refresh token duration
func (m *JWTManager) GetRefreshTokenDuration() time.Duration {
	return m.refreshTokenDuration
}
