-- +goose Up
-- Bootstrap: extension, enums, helper functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
CREATE TYPE program_enum AS ENUM ('networking', 'devsecops', 'programming');
CREATE TYPE registration_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE event_status_enum AS ENUM ('draft', 'open', 'ongoing', 'closed');
CREATE TYPE partner_type_enum AS ENUM ('lab', 'partner_academic', 'partner_industry');

-- updated_at trigger helper
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd

-- +goose Down
DROP FUNCTION IF EXISTS set_updated_at();
DROP TYPE IF EXISTS partner_type_enum;
DROP TYPE IF EXISTS event_status_enum;
DROP TYPE IF EXISTS registration_status_enum;
DROP TYPE IF EXISTS program_enum;
DROP EXTENSION IF EXISTS pgcrypto;

