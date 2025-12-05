export type DocSectionResource = {
  label: string;
  url: string;
};

export type DocSectionTopic = {
  slug: string;
  title: string;
  summary: string;
  details: string[];
  body?: string[];
  references?: DocSectionResource[];
};

export type DocSectionDeepDive = {
  title: string;
  description: string;
  checklist: string[];
  body?: string[];
  codeSample?: {
    language: string;
    content: string;
  };
  resources?: DocSectionResource[];
};

export type DocSection = {
  slug: string;
  title: string;
  description: string;
  lessons: string[];
  deepDive?: DocSectionDeepDive;
  topics?: DocSectionTopic[];
};

export type DocModule = {
  slug: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advance";
  tags: string[];
  focus: string[];
  duration: string;
  sections: DocSection[];
};

export const DOC_MODULES: DocModule[] = [
  {
    slug: "golang-fundamental",
    title: "Golang Fundamental",
    description:
      "Pembelajaran asynchronous tentang dasar bahasa Go, concurrency, dan best practice membuat service kecil.",
    level: "Intermediate",
    tags: ["golang", "backend"],
    focus: ["Concurrency & goroutine", "REST + gRPC mini service", "Testing & profiling"],
    duration: "4–6 minggu",
    sections: [
      {
        slug: "dasar-golang",
        title: "Dasar Golang",
        description: "Kenalan dengan workspace Go, tipe data dasar, error handling, dan modul go test.",
        lessons: [
          "Setup go workspaces + modul",
          "Tipe data dasar, pointer, dan struct",
          "Menulis unit test dan benchmarking sederhana",
        ],
        deepDive: {
          title: "Workshop: men-setup workspace dan membuat modul pertama",
          description:
            "Bagian ini membawa kamu membuat modul `github.com/itts/example-api`, mengenal struktur folder idiomatik, dan menambah unit test pertamamu.",
          checklist: [
            "Inisialisasi `go mod init` + pengaturan `GOWORK` untuk multi-module",
            "Membuat paket `internal/user` dengan struct sederhana + method receiver",
            "Menambahkan unit test tabel untuk fungsi validator dan menjalankan `go test ./...`",
          ],
          body: [
            "Mulai dengan memahami struktur workspace. Untuk project komunitas biasanya kita pisahkan kode ke dalam folder `cmd/` untuk binary utama dan `internal/` untuk domain logic sehingga dependensi tidak bocor keluar modul.",
            "Jalankan `go mod init github.com/itts/example-api` lalu tambahkan file `go.work` jika kamu ingin menggabungkan lebih dari satu modul lokal. Ini membantu ketika membuat modul tambahan seperti `github.com/itts/sharedlib` yang ingin diuji bersamaan.",
            "Buat paket `internal/user` dan definisikan struct `Profile`. Gunakan receiver method agar transformasi kecil terasa natural. Gunakan juga paket `uuid` untuk ID unik sehingga lebih siap diintegrasikan dengan database.",
            "Tambahkan file `internal/user/model_test.go` yang berisi table-driven test untuk fungsi `Sanitize`. Fokus pada variasi input: huruf kapital, spasi di depan/belakang, dan email kosong.",
            "Terakhir, jalankan `go test ./...` lalu tambahkan `go test ./... -run TestProfileSanitize -v` untuk memastikan setiap skenario ter-cover. Biasakan membaca output coverage atau jalankan `go test -cover` untuk melihat area yang belum disentuh.",
          ],
          codeSample: {
            language: "go",
            content: `module github.com/itts/example-api

go 1.22

require (
  github.com/google/uuid v1.6.0
)

// internal/user/model.go
package user

import (
  "strings"

  "github.com/google/uuid"
)

type Profile struct {
  ID    uuid.UUID
  Name  string
  Email string
}

func (p Profile) Sanitize() Profile {
  p.Email = strings.TrimSpace(strings.ToLower(p.Email))
  return p
}`,
          },
          resources: [
            { label: "Go workspace guide", url: "https://go.dev/doc/tutorial/workspaces" },
            { label: "Effective Go - struct & method", url: "https://go.dev/doc/effective_go#structs" },
          ],
        },
        topics: [
          {
            slug: "variabel-dan-tipe-data",
            title: "Variabel & tipe data dasar",
            summary: "Memahami deklarasi dengan short assignment, zero value, dan konversi tipe.",
            details: [
              "Gunakan `:=` untuk deklarasi cepat di dalam blok fungsi, sedangkan deklarasi global tetap memakai `var`.",
              "Kenali zero value untuk setiap tipe agar tahu kapan field belum diisi (string kosong, angka 0, bool false).",
              "Konversi eksplisit antar tipe wajib ditulis, misalnya `int32(total)` agar tidak menimbulkan panic.",
            ],
            body: [
              "Mulai dari pemilihan tipe data yang tepat untuk kasusmu. Misalnya `uint32` cukup untuk counter hit, namun gunakan `int64` ketika angka bisa minus (delta).",
              "Praktikkan shadowing dengan hati-hati: `total := total + inc` terlihat rapi tapi bisa menimpa variabel luar. Gunakan `var` atau assignment biasa jika ingin memperbarui variabel yang sudah ada.",
              "Eksperimen dengan tipe composite seperti `struct` kecil untuk mengelompokkan nilai terkait. Ini membantu ketika ingin melewatkan banyak nilai melalui channel atau fungsi.",
            ],
            references: [
              { label: "Effective Go: Variables", url: "https://go.dev/doc/effective_go#variables" },
              { label: "Tour of Go: Basic types", url: "https://go.dev/tour/basics/11" },
            ],
          },
          {
            slug: "struct-dan-method",
            title: "Struct & method receiver",
            summary: "Mendesain domain model dengan method yang ringkas.",
            details: [
              "Pisahkan struct ke paket `internal/<domain>` agar tidak bocor lintas modul.",
              "Gunakan pointer receiver jika method memodifikasi state, value receiver untuk operasi read-only.",
              "Tambahkan constructor helper (misal `NewProfile`) untuk mengenkapsulasi validasi wajib.",
            ],
            body: [
              "Identifikasi boundary domain, misal `user.Profile` hanya diakses oleh layer service. Ini memudahkan mocking ketika testing.",
              "Beri nama method yang menggambarkan hasilnya, contoh `Normalize()` untuk merapikan field atau `CanActivate()` untuk logic validasi state.",
            ],
          },
          {
            slug: "map-dan-slice",
            title: "Map & slice utility",
            summary: "Mengolah koleksi dengan idiom Go yang aman.",
            details: [
              "Selalu inisialisasi map dengan `make(map[string]string)` sebelum dipakai untuk menghindari panic assignment.",
              "Untuk slice, manfaatkan `append` dan copy supaya tidak berbagi underlying array tanpa sengaja.",
              "Gunakan `for key, value := range data` untuk iterasi; jika hanya butuh nilai, gunakan `_` pada key.",
            ],
            body: [
              "Gunakan kapasitas awal `make([]T, 0, n)` untuk slice agar tidak sering reallocate ketika tahu kira-kira panjangnya.",
              "Untuk map concurrency-safe, bungkus dengan mutex atau gunakan `sync.Map` kalau skenario read-heavy.",
            ],
          },
          {
            slug: "error-handling-testing",
            title: "Error handling & testing",
            summary: "Membuat guard clause yang jelas serta table-driven test.",
            details: [
              "Biasakan return `(T, error)` dan gunakan sentinel error supaya mudah di-compare.",
              "Gunakan `errors.Is` / `errors.As` untuk membedakan tipe error kompleks.",
              "Table-driven test membantu menambah skenario baru tanpa duplikasi kode.",
            ],
            body: [
              "Simpan sentinel error dalam variabel global `var ErrInvalidEmail = errors.New(\"invalid email\")` agar konsisten.",
              "Gunakan subtest (`t.Run`) di table-driven test sehingga ketika satu kasus gagal mudah dilacak.",
            ],
          },
        ],
      },
      {
        slug: "pemrograman-konkuren",
        title: "Pemrograman konkuren",
        description: "Pahami goroutine, channel, context, serta pattern worker pool.",
        lessons: [
          "Goroutine & channel pattern",
          "Context cancellation + timeout",
          "Worker pool / fan-in fan-out",
        ],
      },
      {
        slug: "service-mini",
        title: "Membangun service mini",
        description: "Gabungkan dengan HTTP/gRPC, logging, dan observability sederhana.",
        lessons: [
          "REST vs gRPC skeleton",
          "Structured logging & instrumentation",
          "Deployment + profiling",
        ],
      },
    ],
  },
  {
    slug: "php-modern-playbook",
    title: "PHP Modern Playbook",
    description: "Belajar PHP versi modern, ekosistem framework, sampai prinsip clean code untuk codebase legacy.",
    level: "Beginner",
    tags: ["php", "backend"],
    focus: ["Modern PHP tooling", "Refactoring legacy service", "Deployment best practice"],
    duration: "3–4 minggu",
    sections: [
      {
        slug: "fundamental-php",
        title: "Fundamental modern PHP",
        description: "Composer, autoload, PSR, serta arsitektur dasar.",
        lessons: [
          "Composer & PSR-4 autoload",
          "Struktur folder clean code",
          "PHPStan & unit testing",
        ],
      },
      {
        slug: "framework-praktik-bersih",
        title: "Framework & praktik bersih",
        description: "Gunakan framework populer lalu refactor codebase lama.",
        lessons: [
          "Laravel / Symfony primer",
          "Refactoring controller berat",
          "Service container & dependency injection",
        ],
      },
      {
        slug: "php-deployment-monitoring",
        title: "Deployment & monitoring",
        description: "Optimasi runtime, caching, dan pipeline release.",
        lessons: [
          "OpCache & preloading",
          "Pipeline CI/CD sederhana",
          "Monitoring & alert dasar",
        ],
      },
    ],
  },
  {
    slug: "javascript-builder",
    title: "JavaScript for Builder",
    description: "Catatan JS+TS yang relevan untuk FE, BE, dan integrasi tooling.",
    level: "Intermediate",
    tags: ["javascript", "typescript"],
    focus: ["Pattern modul FE/BE", "Typed API contract", "Tooling & automation"],
    duration: "4–5 minggu",
    sections: [
      {
        slug: "fundamental-js",
        title: "Fundamental JavaScript",
        description: "Variabel modern, async/await, modul bundling.",
        lessons: [
          "ESNext & modul bundler",
          "Async/await & fetch pattern",
          "Testing dengan Vitest",
        ],
      },
      {
        slug: "typed-ecosystem",
        title: "Typed ecosystem",
        description: "TypeScript di FE/BE, shared types, dan integrasi linting.",
        lessons: [
          "Konversi project ke TS",
          "Shared types + zod validation",
          "ESLint + formatting automation",
        ],
      },
      {
        slug: "shipping-builder",
        title: "Shipping builder",
        description: "Bangun mini product end-to-end.",
        lessons: [
          "Mendesain API kontrak",
          "Implementasi FE/BE sinkron",
          "Deployment + monitoring",
        ],
      },
    ],
  },
  {
    slug: "linux-kubernetes-lab",
    title: "Linux & Kubernetes Lab",
    description:
      "Eksperimen CLI, provisioning cluster, sampai operasional helm chart. Cocok buat yang mau mendalami infra.",
    level: "Intermediate",
    tags: ["linux", "kubernetes"],
    focus: ["Linux server essentials", "Kubernetes workshop", "Helm & observability"],
    duration: "6 minggu",
    sections: [
      {
        slug: "linux-essentials",
        title: "Linux essentials",
        description: "Tooling CLI, permission, dan automation shell.",
        lessons: [
          "Navigasi CLI & permission",
          "Service management (systemd)",
          "Shell automation + tmux",
        ],
      },
      {
        slug: "kubernetes-dasar",
        title: "Kubernetes dasar",
        description: "Arsitektur cluster, deployment, service, dan config.",
        lessons: [
          "Membuat cluster lokal + k3d",
          "Deployment & service pattern",
          "Observability dasar (metrics/logs)",
        ],
      },
      {
        slug: "production-readiness",
        title: "Production readiness",
        description: "Helm, secrets management, serta auto scaling.",
        lessons: [
          "Packaging chart helm",
          "Secrets & policy",
          "HPA, backup, dan upgrade strategy",
        ],
      },
    ],
  },
  {
    slug: "penetration-testing-kit",
    title: "Penetration Testing Starter Kit",
    description: "Panduan legal test, threat modeling ringan, dan catatan tools favorit komunitas.",
    level: "Advance",
    tags: ["security", "pentest"],
    focus: ["Threat modeling", "Lab legal penetration testing", "Report & remediation"],
    duration: "5–6 minggu",
    sections: [
      {
        slug: "dasar-keamanan",
        title: "Dasar keamanan",
        description: "Mental model security, threat modeling, legal boundaries.",
        lessons: [
          "Threat modeling & asset mapping",
          "Etika & legal test",
          "Menyusun rules of engagement",
        ],
      },
      {
        slug: "lab-penetration-testing",
        title: "Lab penetration testing",
        description: "Gunakan OWASP top 10, tooling scanning, dan exploit sederhana.",
        lessons: [
          "Recon & enumeration",
          "Manual testing (XSS, SQLi, SSRF)",
          "Automasi scanning open-source",
        ],
      },
      {
        slug: "reporting-remediation",
        title: "Reporting & remediation",
        description: "Cara dokumentasi temuan dan beri rekomendasi perbaikan.",
        lessons: [
          "Menyusun laporan eksekutif & teknis",
          "Prioritas remediation",
          "Membangun habit secure SDLC",
        ],
      },
    ],
  },
  {
    slug: "qa-qe-toolkit",
    title: "QA/QE Toolkit",
    description: "Prinsip quality assurance & engineering, automation, dan cara merancang test plan untuk tim kecil.",
    level: "Beginner",
    tags: ["qa", "qe", "automation"],
    focus: ["Test strategy", "Automation pipeline", "Collaboration workflow"],
    duration: "3 minggu",
    sections: [
      {
        slug: "fundamental-qa",
        title: "Fundamental QA",
        description: "Peran QA/QE, test level, dan requirement clarity.",
        lessons: [
          "Menulis test plan ringan",
          "Test pyramid & coverage",
          "Review requirement & risk",
        ],
      },
      {
        slug: "automation-pipeline",
        title: "Automation pipeline",
        description: "CI/CD untuk test automation, script reusable, dan reporting.",
        lessons: [
          "Memilih tooling automation",
          "Integrasi ke pipeline CI",
          "Membaca dan share hasil test",
        ],
      },
      {
        slug: "kolaborasi-tim",
        title: "Kolaborasi dengan tim",
        description: "Proses quality di tim kecil, retro, dan continuous improvement.",
        lessons: [
          "Membangun quality checklist",
          "QA <> Dev <> PM workflow",
          "Retrospective & perbaikan",
        ],
      },
    ],
  },
];

export function getDocModules() {
  return DOC_MODULES;
}

export function getDocModule(slug: string) {
  return DOC_MODULES.find((doc) => doc.slug === slug);
}

export function getDocSection(moduleSlug: string, sectionSlug: string) {
  const module = getDocModule(moduleSlug);
  if (!module) return null;
  const section = module.sections.find((item) => item.slug === sectionSlug);
  if (!section) return null;
  return { module, section };
}
