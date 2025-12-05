export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  coverImage: string;
  author: {
    name: string;
    role: string;
  };
  tags: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "membangun-komunitas-itts",
    title: "Membangun Komunitas ITTS yang Inklusif",
    summary:
      "Cerita di balik program komunitas dan bagaimana kami menjaga ruang belajar yang aman untuk semua.",
    content: `
### Kenapa Komunitas Penting?

Komunitas menjadi tempat untuk saling belajar, mencoba hal baru, serta bertemu mentor yang tepat.
Di ITTS kami memulai dengan forum kecil setiap minggu dan sekarang berkembang menjadi tiga program utama.

### Dua Hal yang Kami Pelajari

1. **Transparansi**: setiap keputusan program kami bagikan ke mentor dan anggota.
2. **Eksperimentasi**: tidak ada format tunggal, kami selalu uji sesi online/offline.

Terakhir, pastikan selalu ada ruang untuk umpan balik agar program tetap relevan.`,
    publishedAt: "2025-01-05T09:00:00.000Z",
    coverImage: "/images/blog/community.jpg",
    author: { name: "Dini Ramadhani", role: "Community Lead" },
    tags: ["community", "culture"],
  },
  {
    slug: "roadmap-belajar-2025",
    title: "Roadmap Belajar 2025: Networking, DevSecOps, Programming",
    summary:
      "Highlight dari roadmap terbaru lengkap dengan tantangan dan resource yang bisa langsung digunakan.",
    content: `
### Apa yang Baru?
- Networking kini fokus pada praktik observability.
- DevSecOps menambahkan modul threat modeling.
- Programming memecah track FE/BE agar lebih fokus.

### Cara Menggunakan Roadmap
Gabungkan roadmap dengan sesi live, lalu dokumentasikan progres di dashboard anggota.`,
    publishedAt: "2025-01-12T08:30:00.000Z",
    coverImage: "/images/blog/roadmap.jpg",
    author: { name: "Raka Pranata", role: "Curriculum Designer" },
    tags: ["roadmap", "learning"],
  },
  {
    slug: "kisah-member-itts",
    title: "Kisah Member: Dari Volunteer Menjadi Mentor",
    summary:
      "Profil salah satu anggota yang memulai sebagai peserta kemudian aktif menjadi mentor.",
    content: `
Salah satu cerita favorit kami datang dari Anindya yang awalnya gabung karena ingin belajar cloud.
Setelah 8 bulan, ia ikut membantu review tugas dan kini rutin mengisi sesi mentoring.

> "Yang bikin betah karena semua orang saling dukung, bukan hanya kejar materi."

Kami membuka jalur volunteer sepanjang tahun, tinggal isi form di dashboard.`,
    publishedAt: "2025-01-20T14:15:00.000Z",
    coverImage: "/images/blog/member-story.jpg",
    author: { name: "Tim Community", role: "Editor" },
    tags: ["story", "mentor"],
  },
  {
    slug: "tips-mengelola-event-hybrid",
    title: "5 Tips Mengelola Event Hybrid Tanpa Drama",
    summary:
      "Checklist internal tim ketika membuat event hybrid agar pengalaman onsite-online tetap mulus.",
    content: `
### Tips Favorit Tim

1. **Single source of truth**: gunakan doc yang sama untuk MC, moderator, dan operator.
2. **Latihan teknis**: cek audio, latency streaming, dan jalur komunikasi darurat.
3. **Buddy system**: selalu pasangkan volunteer onsite dan online agar info cepat nyebar.

Bonus: siapkan template pesan cepat kalau ada downtime.`,
    publishedAt: "2025-01-24T10:00:00.000Z",
    coverImage: "/images/blog/hybrid-event.jpg",
    author: { name: "Nadia Rahmania", role: "Event Ops" },
    tags: ["event", "ops"],
  },
  {
    slug: "newsletter-pertama-2025",
    title: "Newsletter #01/2025: Apa Kabar Komunitas?",
    summary:
      "Rangkuman aktivitas awal tahun, spotlight anggota, dan daftar resource baru untuk semua program.",
    content: `
### Isi Singkat
- Update progres komunitas dan angka partisipasi.
- Rencana kolaborasi baru dengan kampus/partners.
- Resource yang bisa langsung dicoba (template OKR komunitas + workbook mentoring).

Kalau mau kirim cerita atau rekomendasi konten, tinggal reply newsletter atau chat tim community.`,
    publishedAt: "2025-01-28T07:45:00.000Z",
    coverImage: "/images/blog/newsletter.jpg",
    author: { name: "Editorial ITTS", role: "Newsletter Team" },
    tags: ["newsletter", "community"],
  },
];

export function getBlogPosts() {
  return BLOG_POSTS.sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );
}

export function getBlogPostBySlug(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3) {
  const current = getBlogPostBySlug(slug);
  if (!current) return [];
  return BLOG_POSTS.filter((post) => post.slug !== slug).filter((post) =>
    post.tags.some((tag) => current.tags.includes(tag))
  ).slice(0, limit);
}
