-- +goose Up
-- +goose StatementBegin
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
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM partners WHERE name IN ('Lab Jaringan', 'Lab DevOps', 'Partner Industri A', 'Partner Industri B');
DELETE FROM mentors WHERE full_name IN ('Networking Lead', 'DevSecOps Lead', 'Programming Lead');
DELETE FROM roadmaps WHERE month_number IN (1, 2, 3, 4, 5, 6) AND program IS NULL;
-- +goose StatementEnd
