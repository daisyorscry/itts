# ITTS Community — Backend

Backend untuk platform komunitas ITTS yang berfokus pada edukasi dan aktivitas mahasiswa. Fitur utama: modul pembelajaran (seperti W3Schools) untuk Go, Kubernetes, dan Arsitektur Perangkat Lunak; blog; event; pendaftaran anggota dengan verifikasi email; kurasi mentor dan partner.

---

## Tujuan

- Menyediakan portal belajar bertahap (modul/materi, roadmap, latihan) bagi mahasiswa ITTS.
- Mengelola event komunitas (talk, workshop, bootcamp) beserta RSVP peserta.
- Menyediakan blog/artikel untuk berbagi pengetahuan dan update komunitas.
- Memfasilitasi pendaftaran anggota baru beserta alur verifikasi email.
- Menampilkan mentor dan partner/lab yang mendukung program komunitas.

---

## Fitur Utama (Backend)

- Registrations: pendaftaran anggota, verifikasi email (token), status pending/approved/rejected.
- Roadmaps: rencana belajar 6 bulan + item per bulan (per program atau umum).
- Events: CRUD event, narasumber, pendaftaran peserta (RSVP).
- Mentors & Partners: kurasi mentor aktif dan partner/lab pendukung.
- Blog & Modul Pembelajaran: rencana fitur untuk konten artikel dan materi step‑by‑step (Go, Kubernetes, Arsitektur).

---

## Tech Stack

- Go 1.25+
- Framework HTTP: chii
- ORM: GORM (PostgreSQL)
- Migrations: Goose (SQL)
- Logging: Zap
- Config: Viper (.env)


## Skema Data (inti)

- registrations, email_verifications
- roadmaps, roadmap_items
- events, event_speakers, event_registrations
- mentors, partners

Migrations berada di `internal/db/postgres/migration` dan sudah dipisah per domain.

---

## Menjalankan Lokal

1) Siapkan Postgres dan file `.env` (contoh ada di `be-itts-community/.env`).

2) Jalankan migration Goose:

```bash
go install github.com/pressly/goose/v3/cmd/goose@latest
goose -dir internal/db/postgres/migration postgres "$DB_DSN" up
```

3) Jalankan server:

```bash
go mod download
go run ./cmd
```

---

## Endpoint Utama (sekilas)

- POST `/api/v1/auth/register` — pendaftaran anggota + kirim email verifikasi
- GET  `/api/v1/auth/verify-email?token=...` — verifikasi email
- GET  `/api/v1/events/slug/:slug` — detail event publik
- POST `/api/v1/events/:event_id/register` — RSVP event
- Admin endpoints tersedia untuk CRUD roadmaps, items, mentors, partners, dan events

---

## Roadmap Konten

- Modul belajar bertahap (Go, Kubernetes, Arsitektur) dengan contoh dan latihan.
- Blog komunitas (artikel, highlight event, studi kasus).
- Tracking progres belajar per pengguna (rencana).
- Pencarian materi dan tagging (rencana).

---

## Kontribusi

- Gunakan gaya kode idiomatik Go; pastikan build sukses dan migrasi konsisten.
- Ajukan PR terpisah per fitur; sertakan catatan migrasi bila mengubah skema.

---

## Struktur Project Go (3-Layer per Service)

1. Simpan **setiap service** langsung di dalam `internal/<nama-service>/` tanpa folder `domain`.
2. Di dalam tiap service, gunakan 3 layer: `handler/`, `service/`, `repository/`, dan satu folder `model/` berisi `dao/`, `request/`, `response/`, `mapper/`.
3. Simpan seluruh routing HTTP/gRPC di folder `routes/` (di luar service) untuk konsolidasi daftar & grup route.
4. Simpan paket utilitas bersama di folder `pkg/` setara dengan `routes/`.
qwem
### Layout Direktori

```text
.
├── cmd/
│   ├── api/
│   ├── webhook/
│   ├── worker-build/
│   ├── worker-scan/
│   ├── worker-sign/
│   ├── worker-deploy/
│   ├── metrics-pull/
│   ├── log-tail/
│   └── billing-sync/
├── internal/
│   ├── project/
│   │   ├── handler/
│   │   ├── service/
│   │   ├── repository/
│   │   └── model/
│   │       ├── dao/
│   │       ├── request/
│   │       ├── response/
│   │       └── mapper/
│   ├── pipeline/
│   │   ├── handler/ service/ repository/ model/{dao,request,response,mapper}
│   ├── build/
│   │   ├── handler/ service/ repository/ model/{dao,request,response,mapper}
│   ├── scan/
│   ├── sign/
│   ├── deploy/
│   ├── route/      # untuk ROUTES/ROUTE_RULES
│   ├── addon/
│   ├── billing/
│   └── usage/
├── routes/
│   ├── http.go
│   └── middleware.go
├── pkg/
│   ├── db/
│   ├── cache/
│   ├── mq/
│   ├── s3/
│   ├── registry/
│   ├── auth/
│   ├── httpx/
│   ├── logx/
│   └── config/
└── migrations/
```

### Kontrak Layer

* **handler**: Terima request (HTTP/gRPC), validasi ringan, panggil `service`. Tidak berisi business logic. Kembalikan response DTO.
* **service**: Tempat **seluruh business logic**. Kelola transaksi, orchestrate beberapa repository, terapkan policy/rule.
* **repository**: Akses datasource murni (PostgreSQL/Redis/MQ/S3/Registry). **Tidak** ada rule bisnis; hanya CRUD & query.
* **model/dao**: Struct yang mencerminkan tabel DB (`db:"column"`, `json:"-"` bila sensitif).
* **model/request** & **model/response**: DTO yang dipakai di handler ↔ service.
* **model/mapper**: Fungsi deterministik untuk translate nilai antar lapisan (dao→response, request→dao, dll.).

### Contoh Interface (Build Service)

```go
// internal/build/service/service.go
package service

type Service interface {
    SubmitBuild(ctx context.Context, req request.Submit) (response.Enqueued, error)
    GetBuild(ctx context.Context, id uuid.UUID) (response.Detail, error)
}

// internal/build/repository/repository.go
package repository

type Repository interface {
    InsertRun(ctx context.Context, d dao.BuildRun) (dao.BuildRun, error)
    FindRunByID(ctx context.Context, id uuid.UUID) (dao.BuildRun, error)
}
```

### Aturan Implementasi

1. Letakkan transaksi DB di **service**; repository tetap stateless.
2. Masukkan semua validasi input yang kompleks ke **service**; handler hanya validasi basic (format).
3. Tulis **audit_logs** dari **service** untuk setiap mutasi.
4. Terbitkan event MQ dari **service** (bukan handler), setelah commit sukses.
5. Pastikan mapper **deterministik** dan teruji.

### Routing

1. Setiap service memiliki file routing sendiri di dalam foldernya (`internal/<service>/handler/route.go` atau sejenis) untuk mendefinisikan endpoint milik service tersebut.
2. Hindari membuat folder `routes` di dalam `internal/`; semua definisi route berada di service masing‑masing.
3. Di folder `routes/http.go`, lakukan **pengelompokan (grouping)** dan **registrasi global** seluruh route dari tiap service.
4. Jangan menulis logic di file `routes/http.go` selain inisialisasi grup dan binding handler.
5. Terapkan middleware global (auth, rate limit, tracing) di `routes/middleware.go`.

### Paket Bersama (`pkg/`)

1. Buat util reusable (db, cache, mq, s3, registry, auth, httpx, logx, config).
2. **Hindari** referensi balik dari `pkg/` ke `internal/*` (jaga arah dependensi satu arah).
3. Pastikan `pkg/` bebas business logic.

---

## Isolasi Antar Service (Tanpa Ketergantungan Langsung)

1. **Larangan import silang**: `internal/<svc-a>/...` **dilarang** mengimpor paket di `internal/<svc-b>/...`.
2. **Komunikasi hanya via kontrak**:

   * Asynchronous: **MQ topics** (submit/completed) → gunakan DTO khusus event.
   * Synchronous (jika terpaksa): **HTTP/gRPC** ke `cmd/api` (Control Plane) sebagai *facade*. Hindari service‑to‑service direct call.
3. **Data ownership**: setiap service **hanya** mengakses tabel yang menjadi domainnya melalui **repository** miliknya; akses lintas domain dilakukan via API/event, **bukan** join lintas service.
4. **DTO terpisah per service**: definisikan `model/request` & `model/response` per service; jangan berbagi struct lintas service untuk mencegah coupling tak sengaja.
5. **Mapper sebagai anti‑corruption layer**: semua transformasi nilai antar batas (event ↔ dao ↔ response) terjadi di `model/mapper` milik service tersebut.
6. **Aturan dependensi**:

   * `handler` → boleh mengimpor `service`, `model/*`, dan `pkg/*`.
   * `service` → boleh mengimpor `repository`, `model/*`, dan `pkg/*`.
   * `repository` → boleh mengimpor `model/dao` dan `pkg/*` (DB/Cache/MQ/S3/Registry). **Tidak** boleh mengimpor `service`/`handler`.
7. **Validasi arsitektur**: tambahkan linter/CI check (go‑list + forbidigo/errcheck custom) untuk memblokir import lintas service.
8. **Versioned contracts**: versi‑kan skema event (mis. `build.v1.completed`) untuk kompatibilitas maju/mundur.

--- 

## Aturan Wajib: Transaksi, Locking, Observability, dan Core

- Transaksi di level service:
  - Seluruh mutasi data harus dibungkus transaksi di layer `service` (bukan di handler atau repository).
  - Jika satu use‑case menyentuh beberapa repository, service wajib mengorkestrasi semuanya di dalam satu transaksi.
  - Repository harus mendukung eksekusi dengan DB transaksi yang disuntik dari service (mis. menerima `*gorm.DB` dari service atau expose metode `WithTx`).

- Locking menggunakan Redis (hindari race condition):
  - Setiap transaksi yang berpotensi konflik wajib menggunakan distributed lock berbasis Redis.
  - Kunci minimal dengan pola `lock:{domain}:{key}` dan TTL yang wajar (mis. 5–30 detik) sesuai skenario.
  - Ambil lock sebelum memulai transaksi; lepas lock segera setelah commit/rollback.
  - Pastikan idempotensi pelepasan lock dan penanganan timeout sehingga tidak deadlock.

- Instrumentasi New Relic end‑to‑end:
  - Wajib ada instrumentation di `handler`, `service`, dan `repository`.
  - Propagasi context `nr.Transaction` dari handler → service → repository.
  - Catat segment untuk operasi penting (validation, business rule, external I/O), serta `DatastoreSegment` untuk query DB.
  - Rekam custom attributes (userId, resourceId, status) untuk memudahkan tracing use‑case.

- Logging wajib dan terstruktur:
  - Semua error wajib tercatat dengan level, kode, stack (bila ada), dan korelasi request.
  - Gunakan logger dari paket `core` agar format/field konsisten.
  - Jangan log data sensitif (password/secrets/tokens).

- Standarisasi middleware, error, dan responses via `core`:
  - Gunakan `be-itts-community/core` untuk:
    - logging/middleware standar (trace/correlation, recovery, request log),
    - error types & mapping (HTTP status + kode + pesan),
    - bentuk response JSON konsisten (success/error envelope).
  - Hindari membuat ulang helper serupa di luar `core`.

- Framework HTTP: Chi
  - Router/HTTP server menggunakan `chi`.
  - Middleware global (cors, recovery, request logging) mengacu ke util di `core`.
