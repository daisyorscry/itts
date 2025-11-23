-- +goose Up
CREATE TABLE roadmaps (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program      program_enum,
  month_number INT NOT NULL CHECK (month_number BETWEEN 1 AND 12),
  title        TEXT NOT NULL,
  description  TEXT,
  sort_order   INT NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_roadmaps_program_month
  ON roadmaps (COALESCE(program::text,'*'), month_number);

CREATE TRIGGER trg_roadmaps_updated
BEFORE UPDATE ON roadmaps
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE roadmap_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id  UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  item_text   TEXT NOT NULL,
  sort_order  INT  NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS ix_roadmap_items_roadmap ON roadmap_items (roadmap_id, sort_order);

-- +goose Down
DROP TABLE IF EXISTS roadmap_items;
DROP TABLE IF EXISTS roadmaps;

