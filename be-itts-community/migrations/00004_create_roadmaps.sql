-- +goose Up
-- +goose StatementBegin
-- =========================
-- Roadmap 6 Bulan
-- =========================
-- Set per "track" program (opsional, isi 'common' bila general)
CREATE TABLE roadmaps (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program      program_enum,                  -- NULL = umum untuk semua
  month_number INT NOT NULL CHECK (month_number BETWEEN 1 AND 12),
  title        TEXT NOT NULL,                 -- ex: "Bulan 1 — Fondasi & Infrastruktur"
  description  TEXT,                          -- ringkasan
  sort_order   INT NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique index on program (nullable) and month_number
-- Using composite index with partial indexes for NULL and NOT NULL cases
CREATE UNIQUE INDEX IF NOT EXISTS ux_roadmaps_program_month_not_null
ON roadmaps (program, month_number) WHERE program IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_roadmaps_program_month_null
ON roadmaps (month_number) WHERE program IS NULL;

CREATE TRIGGER trg_roadmaps_updated
BEFORE UPDATE ON roadmaps
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Detail poin-poin per bulan
CREATE TABLE roadmap_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id  UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  item_text   TEXT NOT NULL,
  sort_order  INT  NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS ix_roadmap_items_roadmap ON roadmap_items (roadmap_id, sort_order);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS ix_roadmap_items_roadmap;
DROP TABLE IF EXISTS roadmap_items;
DROP TRIGGER IF EXISTS trg_roadmaps_updated ON roadmaps;
DROP INDEX IF EXISTS ux_roadmaps_program_month_null;
DROP INDEX IF EXISTS ux_roadmaps_program_month_not_null;
DROP TABLE IF EXISTS roadmaps;
-- +goose StatementEnd
