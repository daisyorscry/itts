"use client";

import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/lib/blog/data";

export default function BlogIndexPage() {
  const posts = getBlogPosts();

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          ITTS Community
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Blog & Stories</h1>
        <p className="text-base text-foreground/70">
          Catatan seputar program, roadmap, dan perjalanan komunitas. Semua artikel
          masih prototipe—feel free to shape the real content later.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="relative h-48 w-full">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover transition group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                {new Date(post.publishedAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-foreground transition group-hover:text-primary">
                {post.title}
              </h2>
              <p className="mt-3 flex-1 text-sm text-foreground/70">{post.summary}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-foreground/70">
                <div>
                  <p className="font-medium text-foreground">{post.author.name}</p>
                  <p>{post.author.role}</p>
                </div>
                <span className="text-primary">Read story →</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-3 py-0.5 text-xs font-medium text-foreground/70"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
