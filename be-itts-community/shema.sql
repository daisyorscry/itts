-- Active: 1758200971769@@127.0.0.1@5422@ittscommunity@public
-- === Bootstrap ===
-- UUID generator untuk gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- Enums
-- =========================
CREATE TYPE program_enum AS ENUM ('networking', 'devsecops', 'programming');

CREATE TYPE registration_status_enum AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE event_status_enum AS ENUM ('draft', 'open', 'ongoing', 'closed');

CREATE TYPE partner_type_enum AS ENUM ('lab', 'partner_academic', 'partner_industry');

-- =========================
-- Registrations (pendaftaran anggota)
-- =========================
CREATE TABLE registrations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name        TEXT        NOT NULL,
  email            TEXT      NOT NULL,
  program          program_enum NOT NULL,
  student_id       TEXT        NOT NULL,
  intake_year      INTEGER     NOT NULL CHECK (intake_year BETWEEN 2000 AND 2100),
  motivation       TEXT        NOT NULL,
  status           registration_status_enum NOT NULL DEFAULT 'pending',
  approved_by      TEXT,
  approved_at      TIMESTAMPTZ,
  rejected_reason  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- file: migrations/202509200410_add_email_verification.sql
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS email_verified_at timestamp with time zone NULL;

CREATE TABLE IF NOT EXISTS email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_registrations_email ON registrations(email);

CREATE INDEX IF NOT EXISTS idx_email_verifications_reg ON email_verifications(registration_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token_hash ON email_verifications(token_hash);


-- email kampus unik per pendaftaran aktif (boleh daftar lagi jika sebelumnya rejected)
CREATE UNIQUE INDEX IF NOT EXISTS ux_registrations_email_active
ON registrations (email)
WHERE status IN ('pending','approved');

CREATE INDEX IF NOT EXISTS ix_registrations_status ON registrations (status);
CREATE INDEX IF NOT EXISTS ix_registrations_program ON registrations (program);

-- trigger updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_registrations_updated
BEFORE UPDATE ON registrations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

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

CREATE UNIQUE INDEX IF NOT EXISTS ux_roadmaps_program_month
ON roadmaps (COALESCE(program::text,'*'), month_number);

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

-- =========================
-- Events (Event Terdekat)
-- =========================
CREATE TABLE events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE,                        -- untuk URL
  title        TEXT NOT NULL,
  summary      TEXT,                               -- deskripsi singkat
  description  TEXT,                               -- deskripsi panjang (MD/HTML)
  image_url    TEXT,
  program      program_enum,                       -- optional, terkait program tertentu
  status       event_status_enum NOT NULL DEFAULT 'draft',
  starts_at    TIMESTAMPTZ NOT NULL,
  ends_at      TIMESTAMPTZ,
  venue        TEXT,                               -- lokasi/offline/online link
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_events_time ON events (starts_at DESC);
CREATE INDEX IF NOT EXISTS ix_events_status ON events (status);
CREATE INDEX IF NOT EXISTS ix_events_program ON events (program);

CREATE TRIGGER trg_events_updated
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Narasumber (bisa >1)
CREATE TABLE event_speakers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,            -- ex: "Budi Santoso"
  title      TEXT,                      -- ex: "Cloud Engineer"
  avatar_url TEXT,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS ix_event_speakers_event ON event_speakers (event_id, sort_order);

-- (Opsional) Pendaftaran event (jika nanti buka RSVP)
CREATE TABLE event_registrations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  full_name      TEXT NOT NULL,
  email          TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, email)
);

-- =========================
-- Mentors
-- =========================
CREATE TABLE mentors (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    TEXT NOT NULL,
  title        TEXT,                   -- ex: "DevOps Lead"
  bio          TEXT,
  avatar_url   TEXT,
  programs     program_enum[] NOT NULL DEFAULT '{}', -- bisa lebih dari satu
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  priority     INT NOT NULL DEFAULT 0,               -- untuk urutan tampil
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_mentors_active ON mentors (is_active, priority DESC);
CREATE TRIGGER trg_mentors_updated
BEFORE UPDATE ON mentors
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================
-- Partners & Labs
-- =========================
CREATE TABLE partners (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  kind         partner_type_enum NOT NULL,      -- 'lab' | 'partner_academic' | 'partner_industry'
  subtitle     TEXT,                             -- ex: "Cisco & Mikrotik Lab" / "Cloud provider & internship"
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

-- =========================
-- Seed Minimal (opsional)
-- =========================
-- contoh roadmap umum 6 bulan (hanya header; item isi lewat roadmap_items)
INSERT INTO roadmaps (program, month_number, title, description, sort_order)
VALUES
  (NULL, 1, 'Bulan 1 — Fondasi & Infrastruktur', NULL, 10),
  (NULL, 2, 'Bulan 2 — Workflow Tim & Otomasi', NULL, 20),
  (NULL, 3, 'Bulan 3 — Orkestrasi Kubernetes (Dasar)', NULL, 30),
  (NULL, 4, 'Bulan 4 — Observability & High Availability', NULL, 40),
  (NULL, 5, 'Bulan 5 — Security Engineering', NULL, 50),
  (NULL, 6, 'Bulan 6 — SRE, Scaling & Capstone', NULL, 60);

-- contoh mentors (dummy)
INSERT INTO mentors (full_name, title, programs, avatar_url, priority)
VALUES
  ('Networking Lead', 'CCNA track & lab', ARRAY['networking']::program_enum[], '/mentors/networking.jpg', 100),
  ('DevSecOps Lead', 'CI/CD & Kubernetes', ARRAY['devsecops']::program_enum[], '/mentors/devsecops.jpg', 90),
  ('Programming Lead', 'Go & Web', ARRAY['programming']::program_enum[], '/mentors/programming.jpg', 80);

-- contoh partners/labs (dummy)
INSERT INTO partners (name, kind, subtitle, logo_url, priority)
VALUES
  ('Lab Jaringan', 'lab', 'Cisco & Mikrotik Lab', '/partners/lab-network.png', 100),
  ('Lab DevOps', 'lab', 'CI/CD & Kubernetes Lab', '/partners/lab-devops.png', 90),
  ('Partner Industri A', 'partner_industry', 'Cloud provider & internship', '/partners/partner-a.png', 80),
  ('Partner Industri B', 'partner_industry', 'Security Research & Pentest', '/partners/partner-b.png', 70);
