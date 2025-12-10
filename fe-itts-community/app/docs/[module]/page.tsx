import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getDocBySlug } from "@/lib/mdx";
import { extractHeadings } from "@/lib/mdx/toc";
import { Callout, Tabs, Pre } from "@/components/mdx";
import { TableOfContents } from "@/components/docs/TableOfContents";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import Link from "next/link";

const components = {
  Callout,
  Tabs,
  Pre,
  a: (props: any) => (
    <Link
      href={props.href}
      className="text-primary hover:underline"
      {...props}
    />
  ),
  pre: Pre,
  code: (props: any) => {
    if (!props.className) {
      return <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground/90" {...props} />
    }
    return <code {...props} />
  },
};

const mdxOptions = {
  rehypePlugins: [
    rehypeSlug,
    [rehypeAutolinkHeadings, { behavior: "wrap" }] as any,
    [
      rehypePrettyCode,
      {
        theme: "github-dark",
        keepBackground: false,
      },
    ] as any,
  ],
  remarkPlugins: [remarkGfm],
};

export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const doc = getDocBySlug([module, "index"]);

  if (!doc) {
    notFound();
  }

  const headings = extractHeadings(doc.content);

  return (
    <div className="flex w-full">
      <div className="flex-1 px-6 py-10 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <header className="space-y-3 border-b border-border pb-6">
            <h1 className="text-4xl font-bold tracking-tight">
              {doc.frontmatter.title}
            </h1>
            {doc.frontmatter.description && (
              <p className="text-lg leading-relaxed text-foreground/70">
                {doc.frontmatter.description}
              </p>
            )}
            {doc.frontmatter.tags && (
              <div className="flex flex-wrap gap-2 pt-2">
                {doc.frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <article className="prose prose-slate dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-pre:p-0 prose-pre:bg-transparent prose-code:font-mono max-w-none pt-8">
            <MDXRemote
              source={doc.content}
              components={components}
              options={{ mdxOptions }}
            />
          </article>
        </div>
      </div>

      <TableOfContents items={headings} />
    </div>
  );
}
