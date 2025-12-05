"use client";

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getRelatedPosts } from "@/lib/blog/data";

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.slug);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/blog"
        className="mb-6 inline-flex items-center text-sm font-medium text-primary hover:underline"
      >
        ← Back to blog
      </Link>

      <article className="space-y-6">
        <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-border">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 800px"
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {new Date(post.publishedAt).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
          <p className="text-base text-foreground/70">{post.summary}</p>
          <div className="flex items-center gap-3 text-sm text-foreground/70">
            <div className="font-medium text-foreground">{post.author.name}</div>
            <span aria-hidden="true">•</span>
            <div>{post.author.role}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-3 py-0.5 text-xs font-medium text-foreground/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-border" />

        <div className="prose prose-neutral max-w-none text-foreground/80">
          {post.content
            .trim()
            .split("\n")
            .map((line, idx) => {
              const trimmed = line.trim();
              if (!trimmed) {
                return <p key={idx}>&nbsp;</p>;
              }
              if (trimmed.startsWith("###")) {
                return (
                  <h3 key={idx} className="text-2xl font-semibold">
                    {trimmed.replace(/^###\s*/, "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("- ")) {
                return (
                  <ul key={idx} className="list-disc pl-6">
                    {trimmed
                      .split("- ")
                      .filter(Boolean)
                      .map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="leading-relaxed">
                  {trimmed}
                </p>
              );
            })}
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <div className="mt-12 rounded-3xl border border-border bg-background/60 p-6">
          <h2 className="text-2xl font-semibold">Baca Artikel terkait</h2>
          <p className="mb-4 text-sm text-foreground/70">
            Berdasarkan tag yang kamu baca sekarang.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group space-y-2 rounded-2xl border border-border/60 bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {new Date(related.publishedAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <h3 className="text-lg font-semibold group-hover:text-primary">
                  {related.title}
                </h3>
                <p className="text-sm text-foreground/70 line-clamp-3">{related.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
