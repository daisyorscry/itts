import Link from "next/link";
import { getDocModules } from "@/lib/mdx";

export default async function DocsPage() {
  const modules = await getDocModules();

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-14">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Dokumentasi & modul
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          Ruang belajar terstruktur
        </h1>
        <p className="max-w-3xl text-sm text-foreground/70">
          Pilih modul yang sesuai minat. Semua konten berbentuk catatan modular.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2">
        {modules.map((module: string) => (
          <Link
            key={module}
            href={`/docs/${module}`}
            className="rounded-3xl border border-border bg-background p-5 transition hover:-translate-y-1 hover:shadow"
          >
            <h2 className="text-2xl font-semibold capitalize">
              {module.replace(/-/g, " ")}
            </h2>
            <p className="mt-1 text-sm text-foreground/70">
              Klik untuk melihat detail modul
            </p>
            <div className="mt-4 text-sm font-semibold text-primary">
              Buka modul →
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
