const STATS = [
  { label: "Anggota aktif", value: "1.250+" },
  { label: "Jam mentoring", value: "420+" },
  { label: "Event tahunan", value: "30+" },
  { label: "Kota representasi", value: "18" },
];

const VALUES = [
  {
    title: "Belajar bareng",
    description: "Kita percaya progres terbaik hadir saat materi, mentor, dan peserta saling memberi ruang bertanya.",
  },
  {
    title: "Eksperimen cepat",
    description: "Setiap batch kami uji format baru—hybrid, clinic hours, sampai async challenge.",
  },
  {
    title: "Transparan & inklusif",
    description: "Semua keputusan program terdokumentasi dan bisa diakses volunteer agar komunitas tetap aman.",
  },
];

const CONTACTS = [
  {
    label: "Email tim community",
    value: "community@itts.id",
    href: "mailto:community@itts.id",
  },
  {
    label: "Discord",
    value: "discord.gg/itts-community",
    href: "https://discord.gg/itts-community",
  },
  {
    label: "Instagram",
    value: "@itts.community",
    href: "https://instagram.com/itts.community",
  },
];

const TEAM = [
  { name: "Dini Ramadhani", role: "Community Lead" },
  { name: "Raka Pranata", role: "Curriculum Designer" },
  { name: "Nadia Rahmania", role: "Event Operations" },
  { name: "Tim Editorial", role: "Konten & Newsletter" },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 space-y-16">
      <section className="space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">ITTS Community</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Ruang belajar kolaboratif untuk unfair advantage bareng-bareng
        </h1>
        <p className="mx-auto max-w-3xl text-base text-foreground/70">
          Kami memfasilitasi talenta teknologi di seluruh Indonesia melalui program Networking, DevSecOps,
          dan Programming. Fokus kami sederhana: bantu teman-teman naik level lewat mentorship, eksperimen,
          dan dokumentasi progres yang rapi.
        </p>
      </section>

      <section className="grid gap-4 rounded-3xl border border-border bg-background p-6 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="space-y-1 text-center sm:text-left">
            <div className="text-3xl font-semibold text-foreground">{stat.value}</div>
            <div className="text-sm text-foreground/70">{stat.label}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-border bg-background p-6">
          <h2 className="text-2xl font-semibold">Visi & fokus utama</h2>
          <p className="text-sm text-foreground/70">
            Visi kami: komunitas teknologi yang rendah hati namun punya standard kerja tinggi. Caranya?
            Menyatukan peer-to-peer learning, mentoring profesional, dan dukungan psikologis ringan agar
            semua orang nyaman bereksperimen.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm text-foreground/80">
            <li>Program onboarding untuk mengenal roadmap.</li>
            <li>Weekly lab untuk menguji skill sesuai track.</li>
            <li>Documented playbook agar semua volunteer bisa plug & play.</li>
          </ul>
        </div>
        <div className="space-y-4 rounded-3xl border border-border bg-background p-6">
          <h2 className="text-2xl font-semibold">Nilai yang dijaga</h2>
          <div className="space-y-4">
            {VALUES.map((value) => (
              <div key={value.title} className="rounded-2xl border border-border/60 p-4">
                <h3 className="text-lg font-semibold">{value.title}</h3>
                <p className="text-sm text-foreground/70">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Tim inti & volunteer</h2>
        <p className="text-sm text-foreground/70">
          Program sehari-hari dijalankan tim inti kecil dengan dukungan puluhan volunteer. Semua kolaborator
          bisa gabung via jalur volunteer open call tiap kuartal.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {TEAM.map((person) => (
            <div key={person.name} className="rounded-2xl border border-border/70 bg-background p-4 text-center">
              <div className="text-lg font-semibold">{person.name}</div>
              <p className="text-sm text-foreground/70">{person.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-background p-6">
        <h2 className="text-2xl font-semibold">Kontak & kolaborasi</h2>
        <p className="text-sm text-foreground/70">
          Kirim ide event, dukungan sponsorship, atau pertanyaan media lewat kanal di bawah. Kami biasanya
          merespons dalam 2×24 jam.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {CONTACTS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-2xl border border-border/60 bg-background/70 p-4 transition hover:border-primary"
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
            >
              <p className="text-xs uppercase tracking-widest text-foreground/60">{item.label}</p>
              <p className="text-sm font-semibold text-foreground">{item.value}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
        <h2 className="text-2xl font-semibold">Gabung jadi volunteer?</h2>
        <p className="mt-2 text-sm text-foreground/70">
          Kami selalu cari mentor, notulis, dan event ops baru. Klik tombol di bawah untuk melihat daftar role.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <a
            href="https://forms.gle/itts-community"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90"
          >
            Lihat open roles
          </a>
          <a
            href="mailto:community@itts.id"
            className="rounded-full border border-primary px-6 py-2 text-sm font-semibold text-primary"
          >
            Email tim
          </a>
        </div>
      </section>
    </main>
  );
}
