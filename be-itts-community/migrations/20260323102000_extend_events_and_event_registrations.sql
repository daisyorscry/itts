-- +goose Up
-- +goose StatementBegin
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS benefits TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS capacity INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS price BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'IDR';

ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS institution TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending_verification',
  ADD COLUMN IF NOT EXISTS rejected_reason TEXT,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'not_required',
  ADD COLUMN IF NOT EXISTS payment_provider TEXT,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS payment_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS waitlisted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS ix_event_registrations_status ON event_registrations (status);
CREATE INDEX IF NOT EXISTS ix_event_registrations_payment_status ON event_registrations (payment_status);
CREATE INDEX IF NOT EXISTS ix_event_registrations_verification_token_hash ON event_registrations (verification_token_hash);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS ix_event_registrations_verification_token_hash;
DROP INDEX IF EXISTS ix_event_registrations_payment_status;
DROP INDEX IF EXISTS ix_event_registrations_status;

ALTER TABLE event_registrations
  DROP COLUMN IF EXISTS updated_at,
  DROP COLUMN IF EXISTS cancelled_at,
  DROP COLUMN IF EXISTS rejected_at,
  DROP COLUMN IF EXISTS waitlisted_at,
  DROP COLUMN IF EXISTS approved_at,
  DROP COLUMN IF EXISTS payment_expires_at,
  DROP COLUMN IF EXISTS payment_url,
  DROP COLUMN IF EXISTS payment_reference,
  DROP COLUMN IF EXISTS payment_provider,
  DROP COLUMN IF EXISTS payment_status,
  DROP COLUMN IF EXISTS verification_expires_at,
  DROP COLUMN IF EXISTS verification_token_hash,
  DROP COLUMN IF EXISTS email_verified_at,
  DROP COLUMN IF EXISTS rejected_reason,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS institution,
  DROP COLUMN IF EXISTS phone_number;

ALTER TABLE events
  DROP COLUMN IF EXISTS currency,
  DROP COLUMN IF EXISTS price,
  DROP COLUMN IF EXISTS is_paid,
  DROP COLUMN IF EXISTS registration_deadline,
  DROP COLUMN IF EXISTS capacity,
  DROP COLUMN IF EXISTS benefits;
-- +goose StatementEnd
