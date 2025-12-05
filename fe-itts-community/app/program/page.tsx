const PROGRAMS = [
  {
    name: "Networking",
    focus: "Cloud, observability, incident review",
    modules: [
      "Infra fundamentals & lab monitoring",
      "Playbook incident response",
      "Case study BGP, DNS, dan failover",
    ],
    cadence: "Weekly lab + monthly roundtable",
  },
  {
    name: "DevSecOps",
    focus: "Threat modeling, automation, secure delivery",
    modules: [
      "Pipeline security & policy as code",
      "Red/blue team mini game",
      "Tabletop exercise bersama mentor",
    ],
    cadence: "Clinic hour + shipping challenge tiap kuartal",
  },
  {
    name: "Programming",
    focus: "Frontend & backend shipping challenge",
    modules: [
      "Mini sprint building product nyata",
      "Code review kolektif (async + live)",
      "Portofolio showcase + feedback loop",
    ],
    cadence: "Monthly shipping + pair session",
  },
];

const STEPS = [
  { title: "Apply & onboard", detail: "Isi form minat, pilih track, dan ikut sesi orientasi onboarding." },
  { title: "Pilih jalur belajar", detail: "Ambil roadmap default atau kustom. Kami bantu mapping milestone." },
  { title: "Buat plan personal", detail: "Set target 4–8 minggu dengan mentor/peer. Semua terdokumentasi." },
  { title: "Shipping & review", detail: "Setiap bulan ada shipping challenge, catat progress, dan dapat feedback." },
];

const FAQ = [
  {
    q: "Apakah program berbayar?",
    a: "Tidak. Komunitas dibiayai sponsor/volunteer. Kami hanya minta komitmen ikut kegiatan minimal 1× per minggu.",
  },
  {
    q: "Bagaimana proses seleksi?",
    a: "Kami baca motivasi, cek contoh proyek/catatan kerja, lalu invite interview ringan untuk mengenalmu.",
  },
  {
    q: "Bisa ikut lebih dari satu track?",
    a: "Bisa, tapi kami sarankan fokus ke satu track dulu supaya progresnya lebih kerasa.",
  },
];

export default function ProgramPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-14 px-4 py-14">
      <header className="space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Program utama</p>
        <h1 className="text-4xl font-bold tracking-tight">Roadmap belajar yang hidup</h1>
        <p className="mx-auto max-w-3xl text-base text-foreground/70">
          Setiap track punya mentor, pairing jam, dan shipping challenge sendiri. Konten bisa berubah
          tiap batch karena kami sesuaikan dengan kebutuhan anggota dan tren industri.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        {PROGRAMS.map((program) => (
          <div key={program.name} className="rounded-3xl border border-border bg-background p-6">
            <p className="text-sm uppercase tracking-widest text-primary">{program.name}</p>
            <h2 className="text-2xl font-semibold">{program.focus}</h2>
            <p className="mt-2 text-sm text-foreground/70">{program.cadence}</p>
            <div className="mt-4 space-y-2 text-sm text-foreground/80">
              {program.modules.map((module) => (
                <div key={module} className="rounded-2xl border border-border/60 bg-background/70 p-3">
                  {module}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-border bg-background p-6">
        <h2 className="text-2xl font-semibold">Journey anggota</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-border/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">Step {index + 1}</div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-foreground/70">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-background p-6">
        <h2 className="text-2xl font-semibold">Pertanyaan umum</h2>
        <div className="mt-4 space-y-4">
          {FAQ.map((item) => (
            <details key={item.q} className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <summary className="cursor-pointer text-lg font-semibold">{item.q}</summary>
              <p className="mt-2 text-sm text-foreground/70">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
          <h2 className="text-2xl font-semibold">Siap bergabung ke salah satu track?</h2>
          <p className="mt-2 text-sm text-foreground/70">
            Batch berikutnya dibuka bulan depan. Klik tombol di bawah untuk masuk daftar tunggu.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <a
              href="/login"
              className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90"
            >
              Masuk & daftar track
            </a>
            <a
              href="/community"
              className="rounded-full border border-primary px-6 py-2 text-sm font-semibold text-primary"
            >
              Pelajari komunitas →
            </a>
          </div>
      </section>
    </main>
  );
}
