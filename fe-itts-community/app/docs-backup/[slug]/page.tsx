"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo, use } from "react";
import { useAuth } from "@/feature/auth";
import { getDocModule } from "@/lib/docs/data";

export default function DocDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const module = getDocModule(resolvedParams.slug);
  if (!module) {
    notFound();
  }

  const { isAuthenticated, isLoading, user, accessToken } = useAuth();
  const verifyingSession = isLoading || (!!accessToken && !isAuthenticated);
  const hasAccess = !verifyingSession && isAuthenticated;
  const greeter = useMemo(() => {
    if (!user?.full_name) return "anggota";
    const [first] = user.full_name.split(" ");
    return first || "anggota";
  }, [user?.full_name]);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-14">
      <Link href="/docs" className="text-sm font-semibold text-primary hover:underline">
        ← Kembali ke daftar modul
      </Link>

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{module.level}</p>
        <h1 className="text-4xl font-bold tracking-tight">{module.title}</h1>
        <p className="text-sm text-foreground/70">{module.description}</p>
        <div className="flex flex-wrap gap-2">
          {module.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-border px-3 py-0.5 text-xs text-foreground/60">
              #{tag}
            </span>
          ))}
        </div>
      </header>

      <section className="rounded-3xl border border-border bg-background p-5">
        <h2 className="text-xl font-semibold">Ringkasan modul</h2>
        <p className="text-sm text-foreground/70">
          Modul ini hanya bisa diakses anggota yang sudah masuk. Klik login / daftar di bawah untuk membuka materi.
        </p>
        <div className="mt-4 grid gap-3">
          {module.focus.map((item) => (
            <div key={item} className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm">
              {item}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs uppercase tracking-widest text-foreground/60">Estimasi durasi</p>
        <p className="text-sm font-semibold">{module.duration}</p>
      </section>

      {verifyingSession ? (
        <section className="rounded-3xl border border-border bg-background p-5">
          <div className="space-y-4 animate-pulse">
            <div className="h-4 w-1/3 rounded-full bg-foreground/10" />
            <div className="h-6 w-2/3 rounded-full bg-foreground/10" />
            <div className="space-y-3">
              <div className="h-16 rounded-2xl bg-foreground/5" />
              <div className="h-16 rounded-2xl bg-foreground/5" />
            </div>
          </div>
        </section>
      ) : hasAccess ? (
        <section className="space-y-5 rounded-3xl border border-border bg-background p-5">
          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Status akses</p>
            <h2 className="text-2xl font-semibold">Halo, {greeter}! Kamu sudah bisa belajar.</h2>
            <p className="text-sm text-foreground/70">
              Nikmati kurikulum lengkap yang sudah disusun tim mentor—ikuti alur per bagian supaya progress tetap terukur.
            </p>
          </div>

          <div className="space-y-4">
            {module.sections.map((section, index) => (
              <article key={section.title} className="rounded-2xl border border-border bg-background/60 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
                      Bagian {index + 1}
                    </p>
                    <h3 className="text-xl font-semibold">{section.title}</h3>
                    <p className="text-sm text-foreground/70">{section.description}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {module.level}
                  </span>
                </div>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-foreground/80">
                  {section.lessons.map((lesson) => (
                    <li key={lesson}>{lesson}</li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-foreground/60">Klik untuk membuka konten detail & cabang materi.</p>
                  <Link
                    href={`/docs/${module.slug}/${section.slug}`}
                    className="rounded-full border border-primary px-4 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10"
                  >
                    Buka materi bagian
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-5 text-center">
          <h2 className="text-xl font-semibold">Akses penuh modul</h2>
          <p className="mt-2 text-sm text-foreground/70">
            Kamu perlu login atau daftar sebagai anggota komunitas untuk membuka konten lengkap.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link
              href="/login"
              className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90"
            >
              Login
            </Link>
            <Link
              href="/login?mode=register"
              className="rounded-full border border-primary px-6 py-2 text-sm font-semibold text-primary"
            >
              Daftar anggota
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
