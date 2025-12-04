-- +goose Up
-- +goose StatementBegin

-- First, make password_hash nullable for OAuth users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Create oauth_accounts table
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'github', 'google', etc
    provider_id VARCHAR(255) NOT NULL, -- OAuth provider's user ID
    provider_data JSONB, -- Store additional OAuth data (email, avatar, etc)
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Indexes
    CONSTRAINT idx_oauth_provider_id UNIQUE(provider, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_provider ON oauth_accounts(provider);

-- Add comment
COMMENT ON TABLE oauth_accounts IS 'OAuth provider account linkage';

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TABLE IF EXISTS oauth_accounts;

-- Restore password_hash NOT NULL constraint
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;

-- +goose StatementEnd
