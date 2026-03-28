import { Calendar, Clock3, ArrowLeft, User } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { ImageWithFallback } from '@components/figma/ImageWithFallback';
import { Badge } from '@components/ui/badge';
import { BlogEditor } from '@components/blog/BlogEditor';
import { usePublicBlogPost } from '@feature/blog/hooks';
import { estimateReadTime } from '@feature/blog/types';
import { formatDate } from '@utility/date';

export function BlogDetail() {
  const { slug = '' } = useParams();
  const { data: post, isLoading, error } = usePublicBlogPost(slug, Boolean(slug));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-card py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-foreground/60">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-card py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
            <ArrowLeft size={16} />
            Back to blog
          </Link>
          <h1 className="mt-6 text-3xl font-bold md:text-4xl">Article not found</h1>
          <p className="mt-3 text-foreground/70">
            The requested article does not exist or has not been published yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card">
      <section className="bg-black py-16 text-white md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
            <ArrowLeft size={16} />
            Back to blog
          </Link>

          <div className="mt-8 max-w-4xl">
            <Badge className="border-0 bg-accent text-black">{post.category}</Badge>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">{post.title}</h1>
            <p className="mt-6 text-xl text-white/70">{post.excerpt}</p>

            <div className="mt-8 flex flex-col gap-3 text-sm text-white/65 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{post.author_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formatDate(post.published_at ?? post.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock3 size={16} />
                <span>{estimateReadTime(post.content_json)}</span>
              </div>
              <span>{post.author_role}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-border bg-background">
            <div className="relative h-72 md:h-[420px]">
              <ImageWithFallback src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <BlogEditor content={post.content_json} editable={false} className="border-0 bg-transparent" />

          <div className="mt-12 rounded-3xl border border-border bg-background p-6 md:p-8">
            <h2 className="text-2xl font-bold">Write for the community</h2>
            <p className="mt-3 text-foreground/70">
              This blog is structured to support contributor submissions and admin review. If you
              want to publish your own article, start from the submission page.
            </p>
            <Link
              to="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-black transition-colors hover:bg-accent/90"
            >
              Create blog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
