-- +goose Up
CREATE TABLE mentors (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    TEXT NOT NULL,
  title        TEXT,
  bio          TEXT,
  avatar_url   TEXT,
  programs     program_enum[] NOT NULL DEFAULT '{}',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  priority     INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_mentors_active ON mentors (is_active, priority DESC);

CREATE TRIGGER trg_mentors_updated
BEFORE UPDATE ON mentors
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose Down
DROP TABLE IF EXISTS mentors;

