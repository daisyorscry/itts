-- +goose Up
-- +goose StatementBegin
-- Install CITEXT extension for case-insensitive text (recommended for emails)
CREATE EXTENSION IF NOT EXISTS citext;

-- Convert email columns to CITEXT for case-insensitive matching
ALTER TABLE registrations ALTER COLUMN email TYPE CITEXT;
ALTER TABLE event_registrations ALTER COLUMN email TYPE CITEXT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- Revert to TEXT
ALTER TABLE event_registrations ALTER COLUMN email TYPE TEXT;
ALTER TABLE registrations ALTER COLUMN email TYPE TEXT;

-- Note: We don't drop citext extension in down migration
-- as it might be used by other tables in the future
-- DROP EXTENSION IF EXISTS citext;
-- +goose StatementEnd
