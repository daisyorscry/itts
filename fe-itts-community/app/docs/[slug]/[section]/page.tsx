"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo, useState, use } from "react";
import { useAuth } from "@/feature/auth";
import { getDocSection } from "@/lib/docs/data";

type SectionParams = {
  slug: string;
  section: string;
};

export default function DocSectionDetailPage({ params }: { params: Promise<SectionParams> }) {
  const resolvedParams = use(params);
  const data = getDocSection(resolvedParams.slug, resolvedParams.section);
  if (!data) {
    notFound();
  }

  const { module, section } = data;
  const { isAuthenticated, isLoading, accessToken } = useAuth();
  const verifying = isLoading || (!!accessToken && !isAuthenticated);
  const hasAccess = !verifying && isAuthenticated;
  const topics = section.topics ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTopic = topics[activeIndex] ?? null;
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < topics.length - 1;
  const breadcrumb = useMemo(
    () => [
      { label: "Docs", href: "/docs" },
      { label: module.title, href: `/docs/${module.slug}` },
      { label: section.title, href: `/docs/${module.slug}/${section.slug}` },
    ],
    [module.slug, module.title, section.slug, section.title],
  );

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-14">
      <div className="text-xs font-semibold uppercase tracking-widest text-primary/60">
        <div className="flex flex-wrap items-center gap-2">
          {breadcrumb.map((item, idx) => (
            <span key={item.href}>
              {idx < breadcrumb.length - 1 ? (
                <>
                  <Link href={item.href} className="hover:underline">
                    {item.label}
                  </Link>
                  <span className="mx-2 text-foreground/40">/</span>
                </>
              ) : (
                <span className="text-foreground">{item.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{module.level}</p>
        <h1 className="text-4xl font-bold tracking-tight">{section.title}</h1>
        <p className="text-sm text-foreground/70">{section.description}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-border px-3 py-0.5 text-foreground/60">#{module.slug}</span>
          {module.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-border px-3 py-0.5 text-foreground/60">
              #{tag}
            </span>
          ))}
        </div>
      </header>

      {verifying ? (
        <section className="rounded-3xl border border-border bg-background p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-5 w-1/2 rounded bg-foreground/10" />
            <div className="h-4 w-2/3 rounded bg-foreground/10" />
            <div className="space-y-3">
              <div className="h-16 rounded-2xl bg-foreground/5" />
              <div className="h-16 rounded-2xl bg-foreground/5" />
            </div>
          </div>
        </section>
      ) : hasAccess ? (
        <>
          {topics.length === 0 ? (
            <section className="rounded-3xl border border-border bg-background p-6 text-sm text-foreground/70">
              Materi cabang untuk bagian ini sedang disiapkan.
            </section>
          ) : (
            <div className="flex flex-col gap-8 lg:flex-row">
              <aside className="lg:w-64 lg:flex-shrink-0">
                <div className="sticky top-24 rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">Cabang materi</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {topics.map((topic, idx) => {
                      const active = idx === activeIndex;
                      return (
                        <li key={topic.slug}>
                          <button
                            type="button"
                            onClick={() => setActiveIndex(idx)}
                            className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left ${
                              active ? "bg-primary/10 font-semibold text-primary" : "text-foreground/70 hover:bg-surface"
                            }`}
                          >
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                            <span className="truncate">{topic.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </aside>

              <div className="flex-1 space-y-6">
                {section.deepDive && activeIndex === 0 && (
                  <section className="space-y-4 rounded-3xl border border-border bg-background p-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">Pengantar bagian</p>
                      <h2 className="text-2xl font-semibold">{section.deepDive.title}</h2>
                      <p className="text-sm text-foreground/70">{section.deepDive.description}</p>
                    </div>
                    {section.deepDive.body && (
                      <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
                        {section.deepDive.body.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">Checklist</p>
                      <ul className="mt-2 space-y-2 text-sm text-foreground/80">
                        {section.deepDive.checklist.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {section.deepDive.codeSample && (
                      <div>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary/60">
                          Cuplikan kode ({section.deepDive.codeSample.language})
                        </div>
                        <pre className="overflow-x-auto rounded-xl border border-border bg-slate-900/90 p-4 text-xs text-slate-100">
                          <code>{section.deepDive.codeSample.content}</code>
                        </pre>
                      </div>
                    )}
                    {section.deepDive.resources && (
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        {section.deepDive.resources.map((resource) => (
                          <a
                            key={resource.url}
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-primary/40 px-3 py-1 text-primary hover:bg-primary/10"
                          >
                            {resource.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {activeTopic && (
                  <section className="space-y-5 rounded-3xl border border-border bg-background p-6">
                    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">Topik aktif</p>
                      <h2 className="text-2xl font-semibold">{activeTopic.title}</h2>
                      <p className="text-sm text-foreground/70">{activeTopic.summary}</p>
                    </div>
                    {activeTopic.body && (
                      <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
                        {activeTopic.body.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">Checklist</p>
                      <ul className="mt-3 space-y-2 text-sm text-foreground/80">
                        {activeTopic.details.map((detail) => (
                          <li key={detail} className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {activeTopic.references && (
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        {activeTopic.references.map((ref) => (
                          <a
                            key={ref.url}
                            href={ref.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-primary/40 px-3 py-1 text-primary hover:bg-primary/10"
                          >
                            {ref.label}
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => hasPrev && setActiveIndex((idx) => idx - 1)}
                        disabled={!hasPrev}
                        className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-left text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {hasPrev ? `← ${topics[activeIndex - 1].title}` : "Awal"}
                      </button>
                      <button
                        type="button"
                        onClick={() => hasNext && setActiveIndex((idx) => idx + 1)}
                        disabled={!hasNext}
                        className="flex-1 rounded-2xl border border-primary bg-primary/5 px-4 py-3 text-right text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {hasNext ? `${topics[activeIndex + 1].title} →` : "Tamat bagian"}
                      </button>
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <section className="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-5 text-center">
          <h2 className="text-xl font-semibold">Butuh login untuk membuka bagian</h2>
          <p className="mt-2 text-sm text-foreground/70">
            Silakan login atau daftar anggota komunitas supaya materi detail bisa diakses.
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
