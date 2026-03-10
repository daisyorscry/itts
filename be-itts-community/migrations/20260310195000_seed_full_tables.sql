-- +goose Up
-- +goose StatementBegin

-- ========================================
-- Extended seed data for content, auth, and PMB tables
-- ========================================

-- Additional users
INSERT INTO users (id, email, password_hash, full_name, is_active, is_super_admin, last_login_at)
VALUES
    (
        '40000000-0000-0000-0000-000000000002',
        'events@itts.ac.id',
        '$2a$10$rN8Z8qXvGZqXvGZqXvGZu.hKf9Kf9Kf9Kf9Kf9Kf9Kf9Kf9Kf9K',
        'Event Manager ITTS',
        true,
        false,
        NOW() - INTERVAL '2 day'
    ),
    (
        '40000000-0000-0000-0000-000000000003',
        'content@itts.ac.id',
        '$2a$10$rN8Z8qXvGZqXvGZqXvGZu.hKf9Kf9Kf9Kf9Kf9Kf9Kf9Kf9Kf9K',
        'Content Manager ITTS',
        true,
        false,
        NOW() - INTERVAL '1 day'
    ),
    (
        '40000000-0000-0000-0000-000000000004',
        'oauth.user@itts.ac.id',
        NULL,
        'OAuth User Demo',
        true,
        false,
        NOW() - INTERVAL '6 hour'
    ),
    (
        '40000000-0000-0000-0000-000000000005',
        'applicant.one@itts.ac.id',
        '$2a$10$rN8Z8qXvGZqXvGZqXvGZu.hKf9Kf9Kf9Kf9Kf9Kf9Kf9Kf9Kf9K',
        'Alya Pratama',
        true,
        false,
        NOW() - INTERVAL '3 hour'
    ),
    (
        '40000000-0000-0000-0000-000000000006',
        'applicant.two@itts.ac.id',
        '$2a$10$rN8Z8qXvGZqXvGZqXvGZu.hKf9Kf9Kf9Kf9Kf9Kf9Kf9Kf9Kf9K',
        'Bima Saputra',
        true,
        false,
        NOW() - INTERVAL '90 minute'
    ),
    (
        '40000000-0000-0000-0000-000000000007',
        'applicant.three@itts.ac.id',
        '$2a$10$rN8Z8qXvGZqXvGZqXvGZu.hKf9Kf9Kf9Kf9Kf9Kf9Kf9Kf9Kf9K',
        'Citra Maharani',
        true,
        false,
        NOW() - INTERVAL '30 minute'
    )
ON CONFLICT (email) DO NOTHING;

-- User roles
INSERT INTO user_roles (id, user_id, role_id, granted_by, granted_at, expires_at)
VALUES
    (
        '41000000-0000-0000-0000-000000000001',
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000004',
        '40000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '10 day',
        NULL
    ),
    (
        '41000000-0000-0000-0000-000000000002',
        '40000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000005',
        '40000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '10 day',
        NULL
    ),
    (
        '41000000-0000-0000-0000-000000000003',
        '40000000-0000-0000-0000-000000000004',
        '30000000-0000-0000-0000-000000000006',
        '40000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '8 day',
        NULL
    ),
    (
        '41000000-0000-0000-0000-000000000004',
        '40000000-0000-0000-0000-000000000005',
        '30000000-0000-0000-0000-000000000006',
        '40000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '7 day',
        NULL
    ),
    (
        '41000000-0000-0000-0000-000000000005',
        '40000000-0000-0000-0000-000000000006',
        '30000000-0000-0000-0000-000000000006',
        '40000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '7 day',
        NULL
    ),
    (
        '41000000-0000-0000-0000-000000000006',
        '40000000-0000-0000-0000-000000000007',
        '30000000-0000-0000-0000-000000000006',
        '40000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '7 day',
        NULL
    )
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Registrations
INSERT INTO registrations (
    id, full_name, email, program, student_id, intake_year, motivation,
    status, approved_by, approved_at, rejected_reason, email_verified_at
)
VALUES
    (
        '50000000-0000-0000-0000-000000000001',
        'Rifqi Aditya',
        'rifqi.aditya@student.itts.ac.id',
        'networking',
        '2023001001',
        2023,
        'Ingin memperdalam routing, switching, dan praktik lab jaringan.',
        'pending',
        NULL,
        NULL,
        NULL,
        NOW() - INTERVAL '1 day'
    ),
    (
        '50000000-0000-0000-0000-000000000002',
        'Nadia Rahma',
        'nadia.rahma@student.itts.ac.id',
        'devsecops',
        '2022001002',
        2022,
        'Tertarik membangun pipeline CI/CD yang aman dan otomatis.',
        'approved',
        '40000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '3 day',
        NULL,
        NOW() - INTERVAL '4 day'
    ),
    (
        '50000000-0000-0000-0000-000000000003',
        'Fajar Nugroho',
        'fajar.nugroho@student.itts.ac.id',
        'programming',
        '2021001003',
        2021,
        'Mau fokus di backend Go dan software engineering fundamentals.',
        'rejected',
        NULL,
        NULL,
        'Kuota batch sudah penuh untuk periode ini.',
        NOW() - INTERVAL '5 day'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO email_verifications (id, registration_id, token_hash, expires_at, used_at, created_at)
VALUES
    (
        '50000000-0000-0000-0000-000000000101',
        '50000000-0000-0000-0000-000000000001',
        '1111111111111111111111111111111111111111111111111111111111111111',
        NOW() + INTERVAL '2 day',
        NULL,
        NOW() - INTERVAL '1 day'
    ),
    (
        '50000000-0000-0000-0000-000000000102',
        '50000000-0000-0000-0000-000000000002',
        '2222222222222222222222222222222222222222222222222222222222222222',
        NOW() - INTERVAL '3 day',
        NOW() - INTERVAL '4 day',
        NOW() - INTERVAL '5 day'
    )
ON CONFLICT (id) DO NOTHING;

-- Program-specific roadmaps and items
INSERT INTO roadmaps (id, program, month_number, title, description, sort_order, is_active)
VALUES
    (
        '50000000-0000-0000-0000-000000000201',
        'networking',
        1,
        'Networking Month 1 - Dasar Infrastruktur',
        'Fokus pada pengenalan topologi, subnetting, dan perangkat jaringan.',
        101,
        true
    ),
    (
        '50000000-0000-0000-0000-000000000202',
        'devsecops',
        2,
        'DevSecOps Month 2 - Pipeline Delivery',
        'Membangun CI/CD pipeline dengan quality gate dan scanning.',
        202,
        true
    ),
    (
        '50000000-0000-0000-0000-000000000203',
        'programming',
        3,
        'Programming Month 3 - API Engineering',
        'Pendalaman API design, testing, dan observability backend service.',
        303,
        true
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO roadmap_items (id, roadmap_id, item_text, sort_order)
VALUES
    ('50000000-0000-0000-0000-000000000211', '50000000-0000-0000-0000-000000000201', 'Belajar subnetting dan VLAN untuk simulasi lab.', 10),
    ('50000000-0000-0000-0000-000000000212', '50000000-0000-0000-0000-000000000201', 'Setup routing static dan dynamic dengan perangkat virtual.', 20),
    ('50000000-0000-0000-0000-000000000213', '50000000-0000-0000-0000-000000000202', 'Membuat pipeline build, test, dan image publish otomatis.', 10),
    ('50000000-0000-0000-0000-000000000214', '50000000-0000-0000-0000-000000000202', 'Menambahkan secret scanning dan dependency scanning.', 20),
    ('50000000-0000-0000-0000-000000000215', '50000000-0000-0000-0000-000000000203', 'Mendesain REST API dengan versioning dan error contract yang konsisten.', 10),
    ('50000000-0000-0000-0000-000000000216', '50000000-0000-0000-0000-000000000203', 'Menulis integration test dan profiling bottleneck service.', 20)
ON CONFLICT (id) DO NOTHING;

-- Events and speakers
INSERT INTO events (
    id, slug, title, summary, description, image_url, program, status, starts_at, ends_at, venue
)
VALUES
    (
        '50000000-0000-0000-0000-000000000301',
        'open-house-networking-2026',
        'Open House Networking 2026',
        'Sesi pengenalan jalur networking dan praktik lab dasar.',
        'Workshop hybrid untuk calon peserta komunitas networking.',
        '/events/networking-open-house.jpg',
        'networking',
        'open',
        NOW() + INTERVAL '7 day',
        NOW() + INTERVAL '7 day 3 hour',
        'Auditorium ITTS / Zoom'
    ),
    (
        '50000000-0000-0000-0000-000000000302',
        'devsecops-bootcamp',
        'DevSecOps Bootcamp',
        'Hands-on container security dan deployment pipeline.',
        'Bootcamp intensif dua jam untuk praktik CI/CD aman.',
        '/events/devsecops-bootcamp.jpg',
        'devsecops',
        'ongoing',
        NOW() - INTERVAL '2 hour',
        NOW() + INTERVAL '1 hour',
        'Lab Komputasi 2'
    ),
    (
        '50000000-0000-0000-0000-000000000303',
        'go-backend-sharing-session',
        'Go Backend Sharing Session',
        'Sharing pattern backend service dan testing strategy.',
        'Sesi komunitas programming untuk membedah arsitektur backend modern.',
        '/events/go-sharing-session.jpg',
        'programming',
        'closed',
        NOW() - INTERVAL '14 day',
        NOW() - INTERVAL '14 day + 2 hour',
        'Online'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO event_speakers (id, event_id, name, title, avatar_url, sort_order)
VALUES
    ('50000000-0000-0000-0000-000000000311', '50000000-0000-0000-0000-000000000301', 'Bagas Wicaksono', 'Network Engineer', '/speakers/bagas.jpg', 10),
    ('50000000-0000-0000-0000-000000000312', '50000000-0000-0000-0000-000000000301', 'Dina Kartika', 'Infrastructure Mentor', '/speakers/dina.jpg', 20),
    ('50000000-0000-0000-0000-000000000313', '50000000-0000-0000-0000-000000000302', 'Rama Putra', 'DevSecOps Specialist', '/speakers/rama.jpg', 10),
    ('50000000-0000-0000-0000-000000000314', '50000000-0000-0000-0000-000000000303', 'Salsa Permata', 'Backend Engineer', '/speakers/salsa.jpg', 10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO event_registrations (id, event_id, full_name, email, created_at)
VALUES
    ('50000000-0000-0000-0000-000000000321', '50000000-0000-0000-0000-000000000301', 'Adi Firmansyah', 'adi.firmansyah@example.com', NOW() - INTERVAL '5 hour'),
    ('50000000-0000-0000-0000-000000000322', '50000000-0000-0000-0000-000000000301', 'Bella Salsabila', 'bella.salsabila@example.com', NOW() - INTERVAL '3 hour'),
    ('50000000-0000-0000-0000-000000000323', '50000000-0000-0000-0000-000000000302', 'Chandra Kurniawan', 'chandra.kurniawan@example.com', NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- Mentors and partners
INSERT INTO mentors (id, full_name, title, bio, avatar_url, programs, is_active, priority)
VALUES
    (
        '50000000-0000-0000-0000-000000000401',
        'Intan Prameswari',
        'Senior Site Reliability Engineer',
        'Mentor observability, incident handling, dan reliability engineering.',
        '/mentors/intan.jpg',
        ARRAY['devsecops','programming']::program_enum[],
        true,
        110
    ),
    (
        '50000000-0000-0000-0000-000000000402',
        'Yusuf Maulana',
        'Network Automation Engineer',
        'Fokus pada automation jaringan dan infrastruktur kampus.',
        '/mentors/yusuf.jpg',
        ARRAY['networking']::program_enum[],
        true,
        105
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO partners (id, name, kind, subtitle, description, logo_url, website_url, is_active, priority)
VALUES
    (
        '50000000-0000-0000-0000-000000000501',
        'Akademi Cloud Nusantara',
        'partner_academic',
        'Kelas cloud dan sertifikasi pendamping',
        'Menyediakan materi pendamping untuk workshop cloud native dan monitoring.',
        '/partners/cloud-nusantara.png',
        'https://example.com/cloud-nusantara',
        true,
        95
    ),
    (
        '50000000-0000-0000-0000-000000000502',
        'SecureOps Labs',
        'partner_industry',
        'Laboratorium riset keamanan aplikasi',
        'Partner industri untuk simulasi pentest, code review, dan secure delivery.',
        '/partners/secureops-labs.png',
        'https://example.com/secureops-labs',
        true,
        92
    )
ON CONFLICT (id) DO NOTHING;

-- OAuth, refresh tokens, and audit logs
INSERT INTO oauth_accounts (id, user_id, provider, provider_id, provider_data, created_at, updated_at)
VALUES
    (
        '50000000-0000-0000-0000-000000000601',
        '40000000-0000-0000-0000-000000000004',
        'github',
        'github-oauth-demo-001',
        '{"login":"oauth-demo","avatar_url":"https://avatars.githubusercontent.com/u/1","email":"oauth.user@itts.ac.id"}'::jsonb,
        NOW() - INTERVAL '6 hour',
        NOW() - INTERVAL '6 hour'
    )
ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, revoked_at, created_at)
VALUES
    (
        '50000000-0000-0000-0000-000000000611',
        '40000000-0000-0000-0000-000000000002',
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        NOW() + INTERVAL '7 day',
        NULL,
        NOW() - INTERVAL '1 day'
    ),
    (
        '50000000-0000-0000-0000-000000000612',
        '40000000-0000-0000-0000-000000000003',
        'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        NOW() + INTERVAL '7 day',
        NULL,
        NOW() - INTERVAL '12 hour'
    )
ON CONFLICT (token_hash) DO NOTHING;

INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, metadata, ip_address, user_agent, created_at)
VALUES
    (
        '50000000-0000-0000-0000-000000000621',
        '40000000-0000-0000-0000-000000000001',
        'user.login',
        'users',
        '40000000-0000-0000-0000-000000000001',
        '{"channel":"web","status":"success"}'::jsonb,
        '127.0.0.1',
        'Seed Agent',
        NOW() - INTERVAL '3 hour'
    ),
    (
        '50000000-0000-0000-0000-000000000622',
        '40000000-0000-0000-0000-000000000002',
        'event.create',
        'events',
        '50000000-0000-0000-0000-000000000301',
        '{"title":"Open House Networking 2026"}'::jsonb,
        '127.0.0.1',
        'Seed Agent',
        NOW() - INTERVAL '2 hour'
    ),
    (
        '50000000-0000-0000-0000-000000000623',
        '40000000-0000-0000-0000-000000000003',
        'roadmap.publish',
        'roadmaps',
        '50000000-0000-0000-0000-000000000203',
        '{"program":"programming","month_number":3}'::jsonb,
        '127.0.0.1',
        'Seed Agent',
        NOW() - INTERVAL '1 hour'
    )
ON CONFLICT (id) DO NOTHING;

-- PMB master data
INSERT INTO admission_tracks (id, track_code, track_name, requires_test, is_active, created_at, updated_at)
VALUES
    ('60000000-0000-0000-0000-000000000001', 'SNBP', 'Seleksi Nasional Berdasarkan Prestasi', false, true, NOW(), NOW()),
    ('60000000-0000-0000-0000-000000000002', 'MANDIRI', 'Jalur Mandiri Reguler', true, true, NOW(), NOW()),
    ('60000000-0000-0000-0000-000000000003', 'BEASISWA', 'Jalur Beasiswa Prestasi', true, true, NOW(), NOW())
ON CONFLICT (track_code) DO NOTHING;

INSERT INTO faculties (id, code, name, created_at, updated_at)
VALUES
    ('60000000-0000-0000-0000-000000000101', 'FTI', 'Fakultas Teknologi Informasi', NOW(), NOW()),
    ('60000000-0000-0000-0000-000000000102', 'FTE', 'Fakultas Teknik Elektro', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO study_programs (id, faculty_id, code, name, degree_level, quota, created_at, updated_at)
VALUES
    ('60000000-0000-0000-0000-000000000201', '60000000-0000-0000-0000-000000000101', 'IF', 'Informatika', 'S1', 120, NOW(), NOW()),
    ('60000000-0000-0000-0000-000000000202', '60000000-0000-0000-0000-000000000101', 'SI', 'Sistem Informasi', 'S1', 90, NOW(), NOW()),
    ('60000000-0000-0000-0000-000000000203', '60000000-0000-0000-0000-000000000102', 'TE', 'Teknik Elektro', 'S1', 80, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

INSERT INTO applicants (
    id, user_id, full_name, national_id, place_of_birth, date_of_birth, gender,
    address, phone_number, school_origin, graduation_year, created_at, updated_at
)
VALUES
    (
        '60000000-0000-0000-0000-000000000301',
        '40000000-0000-0000-0000-000000000005',
        'Alya Pratama',
        '3578123400010001',
        'Surabaya',
        DATE '2006-01-14',
        'female',
        'Jl. Raya ITS No. 10 Surabaya',
        '081234560001',
        'SMAN 5 Surabaya',
        '2024',
        NOW(),
        NOW()
    ),
    (
        '60000000-0000-0000-0000-000000000302',
        '40000000-0000-0000-0000-000000000006',
        'Bima Saputra',
        '3578123400010002',
        'Sidoarjo',
        DATE '2005-08-20',
        'male',
        'Jl. Pahlawan 8 Sidoarjo',
        '081234560002',
        'SMKN 2 Sidoarjo',
        '2023',
        NOW(),
        NOW()
    ),
    (
        '60000000-0000-0000-0000-000000000303',
        '40000000-0000-0000-0000-000000000007',
        'Citra Maharani',
        '3578123400010003',
        'Gresik',
        DATE '2005-11-05',
        'female',
        'Jl. Melati 15 Gresik',
        '081234560003',
        'SMAN 1 Gresik',
        '2023',
        NOW(),
        NOW()
    )
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO applications (
    id, applicant_id, track_id, program_id, academic_year, application_number, status, created_at, updated_at
)
VALUES
    (
        '60000000-0000-0000-0000-000000000401',
        '60000000-0000-0000-0000-000000000301',
        '60000000-0000-0000-0000-000000000001',
        '60000000-0000-0000-0000-000000000201',
        '2026/2027',
        'PMB-2026-0001',
        'verified',
        NOW() - INTERVAL '10 day',
        NOW() - INTERVAL '2 day'
    ),
    (
        '60000000-0000-0000-0000-000000000402',
        '60000000-0000-0000-0000-000000000302',
        '60000000-0000-0000-0000-000000000002',
        '60000000-0000-0000-0000-000000000202',
        '2026/2027',
        'PMB-2026-0002',
        're_registered',
        NOW() - INTERVAL '9 day',
        NOW() - INTERVAL '1 day'
    ),
    (
        '60000000-0000-0000-0000-000000000403',
        '60000000-0000-0000-0000-000000000303',
        '60000000-0000-0000-0000-000000000003',
        '60000000-0000-0000-0000-000000000203',
        '2026/2027',
        'PMB-2026-0003',
        'failed',
        NOW() - INTERVAL '8 day',
        NOW() - INTERVAL '12 hour'
    )
ON CONFLICT (application_number) DO NOTHING;

INSERT INTO applicant_documents (
    id, applicant_id, document_type, file_path, verification_status, verified_by, verified_at, created_at, updated_at
)
VALUES
    (
        '60000000-0000-0000-0000-000000000501',
        '60000000-0000-0000-0000-000000000301',
        'rapor',
        '/uploads/pmb/alya/rapor.pdf',
        'valid',
        '40000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '4 day',
        NOW() - INTERVAL '10 day',
        NOW() - INTERVAL '4 day'
    ),
    (
        '60000000-0000-0000-0000-000000000502',
        '60000000-0000-0000-0000-000000000301',
        'ijazah',
        '/uploads/pmb/alya/ijazah.pdf',
        'pending',
        NULL,
        NULL,
        NOW() - INTERVAL '10 day',
        NOW() - INTERVAL '2 day'
    ),
    (
        '60000000-0000-0000-0000-000000000503',
        '60000000-0000-0000-0000-000000000302',
        'rapor',
        '/uploads/pmb/bima/rapor.pdf',
        'valid',
        '40000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '3 day',
        NOW() - INTERVAL '9 day',
        NOW() - INTERVAL '3 day'
    ),
    (
        '60000000-0000-0000-0000-000000000504',
        '60000000-0000-0000-0000-000000000302',
        'sertifikat',
        '/uploads/pmb/bima/sertifikat.pdf',
        'valid',
        '40000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '3 day',
        NOW() - INTERVAL '9 day',
        NOW() - INTERVAL '3 day'
    ),
    (
        '60000000-0000-0000-0000-000000000505',
        '60000000-0000-0000-0000-000000000303',
        'rapor',
        '/uploads/pmb/citra/rapor.pdf',
        'invalid',
        '40000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '2 day',
        NOW() - INTERVAL '8 day',
        NOW() - INTERVAL '2 day'
    ),
    (
        '60000000-0000-0000-0000-000000000506',
        '60000000-0000-0000-0000-000000000303',
        'kartu_keluarga',
        '/uploads/pmb/citra/kk.pdf',
        'valid',
        '40000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '2 day',
        NOW() - INTERVAL '8 day',
        NOW() - INTERVAL '2 day'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO evaluations (id, application_id, evaluation_type, score, notes, created_at, updated_at)
VALUES
    ('60000000-0000-0000-0000-000000000601', '60000000-0000-0000-0000-000000000401', 'academic_score', 88.50, 'Nilai akademik stabil dan konsisten.', NOW() - INTERVAL '4 day', NOW() - INTERVAL '4 day'),
    ('60000000-0000-0000-0000-000000000602', '60000000-0000-0000-0000-000000000401', 'interview', 84.00, 'Komunikasi baik, motivasi jelas.', NOW() - INTERVAL '3 day', NOW() - INTERVAL '3 day'),
    ('60000000-0000-0000-0000-000000000603', '60000000-0000-0000-0000-000000000402', 'written_test', 91.25, 'Hasil tes sangat baik.', NOW() - INTERVAL '3 day', NOW() - INTERVAL '3 day'),
    ('60000000-0000-0000-0000-000000000604', '60000000-0000-0000-0000-000000000402', 'interview', 89.75, 'Memiliki kesiapan belajar tinggi.', NOW() - INTERVAL '2 day', NOW() - INTERVAL '2 day'),
    ('60000000-0000-0000-0000-000000000605', '60000000-0000-0000-0000-000000000403', 'written_test', 60.00, 'Butuh peningkatan dasar numerik.', NOW() - INTERVAL '2 day', NOW() - INTERVAL '2 day'),
    ('60000000-0000-0000-0000-000000000606', '60000000-0000-0000-0000-000000000403', 'other', 55.00, 'Dokumen pendukung kurang lengkap.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO final_results (id, application_id, result_status, final_score, decided_by, decision_date, updated_at)
VALUES
    (
        '60000000-0000-0000-0000-000000000701',
        '60000000-0000-0000-0000-000000000401',
        'waiting_list',
        86.25,
        '40000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '2 day',
        NOW() - INTERVAL '2 day'
    ),
    (
        '60000000-0000-0000-0000-000000000702',
        '60000000-0000-0000-0000-000000000402',
        'passed',
        90.50,
        '40000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    ),
    (
        '60000000-0000-0000-0000-000000000703',
        '60000000-0000-0000-0000-000000000403',
        'failed',
        57.50,
        '40000000-0000-0000-0000-000000000001',
        NOW() - INTERVAL '12 hour',
        NOW() - INTERVAL '12 hour'
    )
ON CONFLICT (application_id) DO NOTHING;

INSERT INTO re_registration (
    id, application_id, re_registration_date, payment_status, payment_proof, created_at, updated_at
)
VALUES
    (
        '60000000-0000-0000-0000-000000000801',
        '60000000-0000-0000-0000-000000000402',
        CURRENT_DATE - 1,
        'paid',
        '/uploads/pmb/bima/payment-proof.png',
        NOW() - INTERVAL '18 hour',
        NOW() - INTERVAL '18 hour'
    )
ON CONFLICT (application_id) DO NOTHING;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DELETE FROM re_registration
WHERE id = '60000000-0000-0000-0000-000000000801';

DELETE FROM final_results
WHERE id IN (
    '60000000-0000-0000-0000-000000000701',
    '60000000-0000-0000-0000-000000000702',
    '60000000-0000-0000-0000-000000000703'
);

DELETE FROM evaluations
WHERE id IN (
    '60000000-0000-0000-0000-000000000601',
    '60000000-0000-0000-0000-000000000602',
    '60000000-0000-0000-0000-000000000603',
    '60000000-0000-0000-0000-000000000604',
    '60000000-0000-0000-0000-000000000605',
    '60000000-0000-0000-0000-000000000606'
);

DELETE FROM applicant_documents
WHERE id IN (
    '60000000-0000-0000-0000-000000000501',
    '60000000-0000-0000-0000-000000000502',
    '60000000-0000-0000-0000-000000000503',
    '60000000-0000-0000-0000-000000000504',
    '60000000-0000-0000-0000-000000000505',
    '60000000-0000-0000-0000-000000000506'
);

DELETE FROM applications
WHERE id IN (
    '60000000-0000-0000-0000-000000000401',
    '60000000-0000-0000-0000-000000000402',
    '60000000-0000-0000-0000-000000000403'
);

DELETE FROM applicants
WHERE id IN (
    '60000000-0000-0000-0000-000000000301',
    '60000000-0000-0000-0000-000000000302',
    '60000000-0000-0000-0000-000000000303'
);

DELETE FROM study_programs
WHERE id IN (
    '60000000-0000-0000-0000-000000000201',
    '60000000-0000-0000-0000-000000000202',
    '60000000-0000-0000-0000-000000000203'
);

DELETE FROM faculties
WHERE id IN (
    '60000000-0000-0000-0000-000000000101',
    '60000000-0000-0000-0000-000000000102'
);

DELETE FROM admission_tracks
WHERE id IN (
    '60000000-0000-0000-0000-000000000001',
    '60000000-0000-0000-0000-000000000002',
    '60000000-0000-0000-0000-000000000003'
);

DELETE FROM audit_logs
WHERE id IN (
    '50000000-0000-0000-0000-000000000621',
    '50000000-0000-0000-0000-000000000622',
    '50000000-0000-0000-0000-000000000623'
);

DELETE FROM refresh_tokens
WHERE id IN (
    '50000000-0000-0000-0000-000000000611',
    '50000000-0000-0000-0000-000000000612'
);

DELETE FROM oauth_accounts
WHERE id = '50000000-0000-0000-0000-000000000601';

DELETE FROM partners
WHERE id IN (
    '50000000-0000-0000-0000-000000000501',
    '50000000-0000-0000-0000-000000000502'
);

DELETE FROM mentors
WHERE id IN (
    '50000000-0000-0000-0000-000000000401',
    '50000000-0000-0000-0000-000000000402'
);

DELETE FROM event_registrations
WHERE id IN (
    '50000000-0000-0000-0000-000000000321',
    '50000000-0000-0000-0000-000000000322',
    '50000000-0000-0000-0000-000000000323'
);

DELETE FROM event_speakers
WHERE id IN (
    '50000000-0000-0000-0000-000000000311',
    '50000000-0000-0000-0000-000000000312',
    '50000000-0000-0000-0000-000000000313',
    '50000000-0000-0000-0000-000000000314'
);

DELETE FROM events
WHERE id IN (
    '50000000-0000-0000-0000-000000000301',
    '50000000-0000-0000-0000-000000000302',
    '50000000-0000-0000-0000-000000000303'
);

DELETE FROM roadmap_items
WHERE id IN (
    '50000000-0000-0000-0000-000000000211',
    '50000000-0000-0000-0000-000000000212',
    '50000000-0000-0000-0000-000000000213',
    '50000000-0000-0000-0000-000000000214',
    '50000000-0000-0000-0000-000000000215',
    '50000000-0000-0000-0000-000000000216'
);

DELETE FROM roadmaps
WHERE id IN (
    '50000000-0000-0000-0000-000000000201',
    '50000000-0000-0000-0000-000000000202',
    '50000000-0000-0000-0000-000000000203'
);

DELETE FROM email_verifications
WHERE id IN (
    '50000000-0000-0000-0000-000000000101',
    '50000000-0000-0000-0000-000000000102'
);

DELETE FROM registrations
WHERE id IN (
    '50000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000002',
    '50000000-0000-0000-0000-000000000003'
);

DELETE FROM user_roles
WHERE id IN (
    '41000000-0000-0000-0000-000000000001',
    '41000000-0000-0000-0000-000000000002',
    '41000000-0000-0000-0000-000000000003',
    '41000000-0000-0000-0000-000000000004',
    '41000000-0000-0000-0000-000000000005',
    '41000000-0000-0000-0000-000000000006'
);

DELETE FROM users
WHERE id IN (
    '40000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000003',
    '40000000-0000-0000-0000-000000000004',
    '40000000-0000-0000-0000-000000000005',
    '40000000-0000-0000-0000-000000000006',
    '40000000-0000-0000-0000-000000000007'
);

-- +goose StatementEnd
