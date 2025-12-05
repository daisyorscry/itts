"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/feature/auth";
import { getDocModules } from "@/lib/docs/data";

export default function DocsPage() {
  const docs = useMemo(() => getDocModules(), []);
  const { isAuthenticated, isLoading, accessToken } = useAuth();
  const verifyingSession = isLoading || (!!accessToken && !isAuthenticated);
  const hasUnlocked = !verifyingSession && isAuthenticated;
  const requiresLogin = !verifyingSession && !isAuthenticated;
  const statusLabel = verifyingSession ? "Memeriksa sesi..." : hasUnlocked ? "Akses aktif" : "Login diperlukan";

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-14">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Dokumentasi & modul</p>
        <h1 className="text-4xl font-bold tracking-tight">Ruang belajar terstruktur</h1>
        <p className="max-w-3xl text-sm text-foreground/70">
          Pilih modul yang sesuai minat. Semua konten berbentuk catatan modular—untuk akses penuh, silakan login
          atau daftar sebagai anggota komunitas.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2">
        {docs.map((doc) => (
          <div
            key={doc.title}
            className="rounded-3xl border border-border bg-background p-5 transition hover:-translate-y-1 hover:shadow"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-widest">
              <span className="font-semibold text-primary">{doc.level}</span>
              <span className={hasUnlocked ? "font-semibold text-primary" : "text-foreground/50"}>{statusLabel}</span>
            </div>
            <h2 className="mt-2 text-2xl font-semibold">{doc.title}</h2>
            <p className="mt-1 text-sm text-foreground/70">{doc.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {doc.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-border px-3 py-0.5 text-xs text-foreground/60">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-foreground/70">
              <Link href={`/docs/${doc.slug}`} className="font-semibold text-primary hover:underline">
                {hasUnlocked ? "Buka modul" : "Lihat detail modul"}
              </Link>
              {requiresLogin ? (
                <Link
                  href="/login"
                  className="rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary"
                >
                  Login / daftar
                </Link>
              ) : (
                <span className="text-xs font-semibold text-foreground/60">Siap belajar</span>
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
