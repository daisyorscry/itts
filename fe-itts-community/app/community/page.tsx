const ACTIONS = [
  {
    title: "Daftar event terdekat",
    description: "Lihat daftar event publik/hybrid yang bisa diikuti untuk networking dan showcase project.",
    href: "/events",
    cta: "Lihat event",
  },
  {
    title: "Gabung jalur volunteer",
    description: "Bantu jadi fasilitator, notulis, atau event ops. Cocok untuk yang ingin belajar leadership ringan.",
    href: "https://forms.gle/itts-community",
    cta: "Isi form volunteer",
  },
  {
    title: "Akses portal member",
    description: "Track progress roadmap, upload catatan sesi, dan lihat scoreboard kontributor.",
    href: "/login",
    cta: "Masuk portal",
  },
];

const HIGHLIGHTS = [
  {
    title: "Networking Track",
    detail: "Belajar cloud & observability bareng engineer senior. Ada lab mingguan + review catatan incident.",
  },
  {
    title: "DevSecOps Track",
    detail: "Fokus threat modeling dan automation. Sering ada mini-game red team vs blue team.",
  },
  {
    title: "Programming Track",
    detail: "Split FE/BE, tiap bulan ada shipping challenge supaya anggota bisa bangun portfolio nyata.",
  },
];

const STORIES = [
  {
    name: "Anindya",
    role: "Mentor volunteer",
    quote: "Mulai sebagai peserta, sekarang bantu mentoring. Komunitas ini bikin aku ngerasa punya tim.",
  },
  {
    name: "Damar",
    role: "DevSecOps track",
    quote: "Suka banget sama format clinic hour. Bisa curhat blockers terus langsung dapet action list.",
  },
];

export default function CommunityPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-14 px-4 py-14">
      <section className="space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Komunitas ITTS</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Kawasan bertumbuh untuk builder, mentor, dan volunteer
        </h1>
        <p className="mx-auto max-w-3xl text-base text-foreground/70">
          Komunitas ini didesain supaya semua orang bisa upgrade skill sambil berkolaborasi. Tidak harus jago,
          yang penting mau belajar bareng dan siap bereksperimen.
        </p>
      </section>

      <section className="grid gap-6 rounded-3xl border border-border bg-background p-6 md:grid-cols-3">
        {ACTIONS.map((action) => (
          <a
            key={action.title}
            href={action.href}
            target={action.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="flex flex-col rounded-2xl border border-border/70 bg-background/70 p-4 transition hover:border-primary"
          >
            <h2 className="text-lg font-semibold">{action.title}</h2>
            <p className="mt-1 text-sm text-foreground/70">{action.description}</p>
            <span className="mt-4 text-sm font-semibold text-primary">{action.cta} →</span>
          </a>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-border bg-background p-6">
          <h2 className="text-2xl font-semibold">Kenapa gabung?</h2>
          <p className="text-sm text-foreground/70">
            Ada labs mingguan, mentoring 1:1 (berbasis slot), ruang mental health, dan banyak peer review
            catatan kerja. Kami juga rajin bikin event offline kecil di beberapa kota.
          </p>
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-foreground/70">
            Kami memprioritaskan anggota yang aktif kirim catatan progres. Tidak ada biaya keanggotaan,
            cukup komitmen untuk belajar bareng secara konsisten.
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-border bg-background p-6">
          <h2 className="text-2xl font-semibold">Highlight program</h2>
          <div className="space-y-4">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border/70 p-4">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-sm text-foreground/70">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-background p-6">
        <h2 className="text-2xl font-semibold">Cerita anggota</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {STORIES.map((story) => (
            <div key={story.name} className="rounded-2xl border border-border/70 bg-background/80 p-5">
              <p className="text-sm italic text-foreground/80">“{story.quote}”</p>
              <div className="mt-3 text-sm font-semibold text-foreground">{story.name}</div>
              <div className="text-xs text-foreground/60">{story.role}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
        <h2 className="text-2xl font-semibold">Punya ide kolaborasi?</h2>
        <p className="mt-2 text-sm text-foreground/70">
          Mau bikin study group, meetup kecil, atau kolaborasi konten? Chat tim community langsung.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <a
            href="https://discord.gg/itts-community"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90"
          >
            Join Discord
          </a>
          <a
            href="mailto:community@itts.id"
            className="rounded-full border border-primary px-6 py-2 text-sm font-semibold text-primary"
          >
            Email tim community
          </a>
        </div>
      </section>
    </main>
  );
}
