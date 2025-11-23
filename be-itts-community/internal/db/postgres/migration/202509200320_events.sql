-- +goose Up
CREATE TABLE events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE,
  title        TEXT NOT NULL,
  summary      TEXT,
  description  TEXT,
  image_url    TEXT,
  program      program_enum,
  status       event_status_enum NOT NULL DEFAULT 'draft',
  starts_at    TIMESTAMPTZ NOT NULL,
  ends_at      TIMESTAMPTZ,
  venue        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_events_time ON events (starts_at DESC);
CREATE INDEX IF NOT EXISTS ix_events_status ON events (status);
CREATE INDEX IF NOT EXISTS ix_events_program ON events (program);

CREATE TRIGGER trg_events_updated
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE event_speakers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  title      TEXT,
  avatar_url TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS ix_event_speakers_event ON event_speakers (event_id, sort_order);

CREATE TABLE event_registrations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  full_name      TEXT NOT NULL,
  email          TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, email)
);

-- +goose Down
DROP TABLE IF EXISTS event_registrations;
DROP TABLE IF EXISTS event_speakers;
DROP TABLE IF EXISTS events;

