# Panduan Observabilitas New Relic

Dokumen ini menjelaskan bagaimana _stack_ ITTS Community sudah terintegrasi dengan New Relic, cara mengaktifkannya, serta panduan praktis untuk membaca metrik yang dikirim dari layanan backend (`be-itts-community`). Semua contoh di bawah memakai bahasa Go, tetapi konsepnya sama untuk lingkungan lainnya.

## Apa yang Sudah Diinstrumentasi

- **HTTP request** – Setiap request REST API lewat router `chi` dibungkus oleh middleware `nr.Middleware` sehingga New Relic dapat membuat web transaction per rute (lihat `be-itts-community/pkg/observability/nr/middleware.go`).
- **Bisnis/service layer** – Hampir seluruh metode service memanggil `defer s.tracer.StartSegment(...)` sehingga setiap fungsi bisnis tampil jelas di trace (contoh: `internal/service/auth_service.go:46` untuk `AuthService.Login`).
- **Database layer** – Semua repository menggunakan `repository.RepoTracer` untuk membuat `DatastoreSegment` ketika menjalankan kueri (lihat deklarasi `internal/repository/common.go:30-32` dan pemakaian di setiap repo, mis. `internal/repository/auth_repo.go:23-33`).
- **Graceful fallback** – Jika konfigurasi New Relic belum diisi, aplikasi otomatis memakai `nr.NewNoopTracer()` sehingga kode tetap berjalan tanpa perlu perubahan lain (`be-itts-community/cmd/server.go:63-81`).

Dengan struktur tersebut, Anda mendapatkan _insight_ end-to-end mulai dari HTTP → service → repository/DB hanya dengan mengisi konfigurasi New Relic.

## Menyiapkan Akun & API Key

1. Buat akun atau login ke [New Relic One](https://one.newrelic.com/).
2. Buka menu **APM & Services → Add Data** lalu pilih bahasa **Go**.
3. Ambil **License Key** dari halaman tersebut (biasanya berupa string 40 karakter). Simpan juga nama aplikasi (App Name) yang ingin tampil di dashboard New Relic.

## Konfigurasi Aplikasi

Backend membaca konfigurasi di `be-itts-community/.env` melalui `config.LoadConfig()` (`be-itts-community/config/config.go:104-107`). Tambahkan variabel berikut:

```env
# Observability / New Relic
NEW_RELIC_ENABLED=true
NEW_RELIC_APP_NAME=itts-community-api-dev
NEW_RELIC_LICENSE_KEY=<license-key-dari-new-relic>
```

Penjelasan variabel:

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `NEW_RELIC_ENABLED` | Ya | Set `true` untuk mengaktifkan integrasi. Saat `false`, backend otomatis fallback ke tracer noop. |
| `NEW_RELIC_APP_NAME` | Ya | Nama yang muncul di APM → Services. Gunakan nama berbeda per environment (contoh `itts-community-api-prod`). |
| `NEW_RELIC_LICENSE_KEY` | Ya | License key global dari akun New Relic Anda. |

> **Catatan:** Jangan commit nilai `LICENSE_KEY`. Simpan di secrets manager CI/CD atau `.env` lokal yang tidak dilacak git.

### Docker Compose

Jika menjalankan via `docker-compose up`, pastikan file `be-itts-community/.env` yang dirujuk oleh service `api` (lihat `docker-compose.yml`) sudah memuat variabel di atas.

## Menjalankan Backend Dengan New Relic

```bash
cd be-itts-community
go run cmd/server.go
```

Saat server start, log akan menampilkan `new relic enabled` apabila koneksi ke agent sukses (`be-itts-community/cmd/server.go:71-74`). Jika terjadi masalah, Anda akan melihat `failed to init new relic; using noop tracer` berserta error agent – periksa kembali license key atau konektivitas jaringan outbound ke New Relic.

Untuk deployment container, pastikan port outbound 443 dibuka karena agent Go akan mengirim data ke `collector.newrelic.com`.

## Membaca Data di New Relic

1. Masuk ke **APM & Services → Services** dan pilih `NEW_RELIC_APP_NAME` yang Anda set.
2. Tab **Summary** akan menampilkan:
   - **Response time** per endpoint (_web transaction_ bernama `GET /api/v1/...`) karena middleware otomatis memberi nama `METHOD + route pattern`.
   - **Throughput & Error rate** berdasarkan log request.
3. Tab **Transactions** memperlihatkan detail trace; klik satu transaksi untuk melihat urutan segment:
   - `AuthService.*` atau `EventService.*` berasal dari `StartSegment` di service layer.
   - `Datastore/Postgres/<collection>/<operation>` berasal dari `StartDatastoreSegment` di repository.
4. Tab **Distributed tracing** aktif otomatis (`newrelic.ConfigDistributedTracerEnabled(true)`) sehingga Anda dapat mengikuti lompatan antar layanan jika kelak menambah worker lain dengan header tracing yang sama.

## Menambahkan Instrumentasi Baru

`nr.Tracer` adalah interface kecil (`be-itts-community/pkg/observability/nr/tracer.go`) sehingga Anda bebas menyuntikkan tracing ke bagian lain:

```go
func (s *emailScheduler) Run(ctx context.Context) {
    if s.tracer != nil {
        end := s.tracer.StartSegment(ctx, "EmailScheduler.Run")
        defer end()
    }
    // ... lakukan pekerjaan
}
```

Bila perlu menandai operasi non-database, gunakan `StartSegment`. Jika operasi menyentuh datastore selain Postgres, Anda bisa meniru `StartDatastoreSegment` dengan `newrelic.DatastoreSegment` dan mengganti `Product`.

Untuk asynchronous background job tanpa HTTP request, buat `txn := tracer.App.StartTransaction("Job/SendDigest")`, bungkus logic, lalu panggil `txn.End()`. Jangan lupa meneruskan context yang berisi transaksi agar repository tetap tercatat.

## Troubleshooting

- **Tidak muncul di dashboard** – pastikan proses benar-benar mengirim data (log `new relic enabled` muncul) dan server memiliki akses outbound TLS ke domain New Relic.
- **License salah** – agen akan mengembalikan error `invalid license key`. Regenerasi key di New Relic UI lalu update `.env`.
- **Nama rute kurang ramah** – middleware menggunakan `chi.RouteContext` untuk membaca pattern (`pkg/observability/nr/middleware.go:13-20`). Jika Anda membuat handler manual tanpa router, kirim nama transaksi spesifik ketika memanggil `StartWebTxn`.
- **Ingin mematikan sementara** – set `NEW_RELIC_ENABLED=false` lalu restart service; kode tetap berjalan karena tracer fallback.

Dengan panduan ini, Anda dapat mengaktifkan New Relic hanya dengan mengisi tiga variabel environment dan langsung mendapatkan visibilitas menyeluruh atas request, logic, serta query database aplikasi ITTS Community.
