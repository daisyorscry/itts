-- +goose Up
-- +goose StatementBegin
-- Add email_verified_at column to registrations
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ NULL;

-- Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create unique index on registrations email
CREATE UNIQUE INDEX IF NOT EXISTS ux_registrations_email ON registrations(email);

-- Create indexes on email_verifications
CREATE INDEX IF NOT EXISTS idx_email_verifications_reg ON email_verifications(registration_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token_hash ON email_verifications(token_hash);

-- email kampus unik per pendaftaran aktif (boleh daftar lagi jika sebelumnya rejected)
CREATE UNIQUE INDEX IF NOT EXISTS ux_registrations_email_active
ON registrations (email)
WHERE status IN ('pending','approved');
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS ux_registrations_email_active;
DROP INDEX IF EXISTS idx_email_verifications_token_hash;
DROP INDEX IF EXISTS idx_email_verifications_reg;
DROP INDEX IF EXISTS ux_registrations_email;
DROP TABLE IF EXISTS email_verifications;
ALTER TABLE registrations DROP COLUMN IF EXISTS email_verified_at;
-- +goose StatementEnd
