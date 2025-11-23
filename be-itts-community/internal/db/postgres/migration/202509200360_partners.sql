-- +goose Up
CREATE TABLE partners (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  kind         partner_type_enum NOT NULL,
  subtitle     TEXT,
  description  TEXT,
  logo_url     TEXT,
  website_url  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  priority     INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_partners_kind ON partners (kind, is_active, priority DESC);

CREATE TRIGGER trg_partners_updated
BEFORE UPDATE ON partners
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose Down
DROP TABLE IF EXISTS partners;

