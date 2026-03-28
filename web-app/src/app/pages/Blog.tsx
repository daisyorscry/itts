import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, PenSquare } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '@components/ui/badge';
import { ImageWithFallback } from '@components/figma/ImageWithFallback';
import { useListPublicBlogPosts } from '@feature/blog/hooks';
import type { BlogCategory } from '@feature/blog/types';
import { formatDate } from '@utility/date';

const categories: Array<'All' | BlogCategory> = ['All', 'Programming', 'DevSecOps', 'Networking', 'Career', 'Community'];

export function Blog() {
  const { data } = useListPublicBlogPosts({ page_size: 12 });
  const posts = data?.data ?? [];
  const featuredPost = posts.find((post) => post.featured) ?? posts[0];
  const latestPosts = posts.filter((post) => post.id !== featuredPost?.id);

  return (
    <div className="min-h-screen">
      <section className="bg-black py-16 text-white md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              ITTS <span className="text-accent">Blog</span>
            </h1>
            <p className="text-xl text-white/70">
              Articles, build notes, project stories, and practical technical insights from the
              community. This page is set up so contributors can grow into a real publishing flow.
            </p>
            <div className="mt-8">
              <Link
                to="/register"
                className="inline-flex items-center rounded-full bg-accent px-6 py-3 font-semibold text-black transition-colors hover:bg-accent/90"
              >
                <span>Create Blog</span>
                <PenSquare className="ml-2" size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category, index) => (
              <button
                key={category}
                className={`rounded-full px-4 py-2 font-medium transition-colors ${
                  index === 0
                    ? 'bg-accent text-black'
                    : 'border border-border bg-background hover:border-accent hover:text-accent'
                }`}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">Featured Article</h2>
              <p className="mt-2 text-foreground/70">Start with one highlighted post before the rest of the feed.</p>
            </div>
            <Badge className="border-0 bg-accent text-black">Featured</Badge>
          </div>

          {featuredPost ? (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-3xl border border-border bg-background"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-72 lg:h-auto">
                  <ImageWithFallback
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
                  <Badge variant="outline" className="mb-4 w-fit text-xs">
                    {featuredPost.category}
                  </Badge>
                  <h3 className="mb-4 text-3xl font-bold">{featuredPost.title}</h3>
                  <p className="mb-6 text-foreground/70">{featuredPost.excerpt}</p>
                  <div className="mb-6 flex flex-col gap-3 text-sm text-foreground/60 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{formatDate(featuredPost.date)}</span>
                    </div>
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <Link
                    to={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center font-medium text-accent transition-colors hover:underline"
                  >
                    Read article
                    <ArrowRight className="ml-2" size={16} />
                  </Link>
                </div>
              </div>
            </motion.article>
          ) : null}
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">Latest Posts</h2>
              <p className="mt-2 text-foreground/70">
                Direct blog listing with the same visual rhythm as the rest of the public pages.
              </p>
            </div>
            <div className="text-sm text-foreground/60">{posts.length} posts</div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group overflow-hidden rounded-3xl border border-border bg-card transition-all hover:border-accent/50"
              >
                <Link to={`/blog/${post.slug}`} className="block">
                  <div className="relative h-52 overflow-hidden">
                    <ImageWithFallback
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-6">
                    <Badge variant="outline" className="mb-3 text-xs">
                      {post.category}
                    </Badge>
                    <h3 className="mb-3 text-xl font-bold transition-colors group-hover:text-accent">
                      {post.title}
                    </h3>
                    <p className="mb-4 line-clamp-3 text-sm text-foreground/70">{post.excerpt}</p>

                    <div className="flex flex-col gap-3 text-xs text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="font-medium text-foreground">{post.author}</div>
                        <div>{post.role}</div>
                      </div>
                      <div className="sm:text-right">
                        <div>{formatDate(post.date)}</div>
                        <div>{post.readTime}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">Want to write for ITTS Blog?</h2>
          <p className="mb-8 text-lg text-foreground/70">
            Contributors can already start from a public submission form. Admin review can refine,
            approve, or reject drafts before publishing is wired to a backend.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center rounded-full bg-accent px-10 py-4 font-semibold text-black transition-colors hover:bg-accent/90"
          >
            <span>Create Blog</span>
            <PenSquare className="ml-2" size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
