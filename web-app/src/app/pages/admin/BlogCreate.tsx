import { zodResolver } from '@hookform/resolvers/zod';
import * as Icons from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { type JSONContent } from '@tiptap/core';
import { BlogEditor } from '@components/blog/BlogEditor';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import { Input } from '@components/ui/input';
import * as LayoutUI from '@components/ui/layout';
import * as SelectUI from '@components/ui/select';
import { Text } from '@components/ui/text';
import { useCreateBlogSubmission } from '@feature/blog/hooks';
import { blogSubmissionSchema, type BlogCategory, type BlogSubmissionFormData } from '@feature/blog/types';
import { useAuthStore } from '@store/auth.store';

const categoryOptions: BlogCategory[] = ['Programming', 'DevSecOps', 'Networking', 'Career', 'Community'];
const emptyDocument: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: '' }],
    },
  ],
};

export function AdminBlogCreate() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { mutate: createSubmission, isPending } = useCreateBlogSubmission();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogSubmissionFormData>({
    resolver: zodResolver(blogSubmissionSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      authorName: user?.full_name ?? '',
      authorEmail: user?.email ?? '',
      role: user?.roles?.[0]?.name ?? 'Admin',
      category: undefined,
      content: emptyDocument,
    },
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    reset((currentValues) => ({
      ...currentValues,
      authorName: user?.full_name ?? currentValues.authorName,
      authorEmail: user?.email ?? currentValues.authorEmail,
      role: user?.roles?.[0]?.name ?? currentValues.role ?? 'Admin',
    }));
  }, [reset, user]);

  const onSubmit = (data: BlogSubmissionFormData) => {
    createSubmission(data, {
      onSuccess: () => {
        navigate('/admin/blog');
      },
    });
  };

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
        <LayoutUI.Row gap="gap-4">
          <Button type="button" onClick={() => navigate('/admin/blog')} variant="ghost-inverse" size="icon">
            <Icons.ArrowLeft size={20} />
          </Button>
          <LayoutUI.Column gap="gap-2">
            <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">
              Create Blog
            </Text>
            <Text variant="muted-inverse" className="max-w-2xl">
              Write on the left. Configure the post on the right.
            </Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
        <LayoutUI.Row gap="gap-3" className="max-md:w-full">
          <Button type="button" variant="destructive" size="form" onClick={() => navigate('/admin/blog')}>
            Cancel
          </Button>
          <Button type="submit" form="blog-create-form" variant="accent" size="form" disabled={isPending}>
            <Icons.Save size={18} />
            {isPending ? 'Saving...' : 'Create Blog'}
          </Button>
        </LayoutUI.Row>
      </LayoutUI.Row>

      <FormUI.FormRoot id="blog-create-form" onSubmit={handleSubmit(onSubmit)} gap="lg">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <CardUI.Card tone="inverse" border={false} className="min-h-[calc(100vh-240px)]">
            <CardUI.CardContent padding="auth" spacing="lg" className="h-full">
              <LayoutUI.Column gap="gap-4" className="h-full">
                <LayoutUI.Column gap="gap-2">
                  <Text variant="inverse" className="font-['Sora'] text-xl font-semibold">
                    Editor
                  </Text>
                  <Text variant="muted-inverse">
                    Use headings, links, images, and code blocks directly in the article body.
                  </Text>
                </LayoutUI.Column>

                <FormUI.FormField id="content" label="Content" error={errors.content?.message} required tone="inverse">
                  <BlogEditor
                    content={watch('content')}
                    onChange={(value) => setValue('content', value, { shouldDirty: true, shouldValidate: true })}
                    placeholder="Start writing the post here..."
                    className="min-h-[calc(100vh-420px)]"
                  />
                </FormUI.FormField>
              </LayoutUI.Column>
            </CardUI.CardContent>
          </CardUI.Card>

          <CardUI.Card tone="inverse" border={false} className="h-fit xl:sticky xl:top-6">
            <CardUI.CardContent padding="auth" spacing="lg">
              <LayoutUI.Column gap="gap-5">
                <LayoutUI.Column gap="gap-2">
                  <Text variant="inverse" className="font-['Sora'] text-xl font-semibold">
                    Post Settings
                  </Text>
                  <Text variant="muted-inverse">
                    Configure the title, slug, excerpt, author, and category here.
                  </Text>
                </LayoutUI.Column>

                <FormUI.FormField id="title" label="Article Title" error={errors.title?.message} required tone="inverse">
                  <Input
                    id="title"
                    {...register('title')}
                    icon={<Icons.PenSquare size={18} />}
                    hasError={Boolean(errors.title)}
                    tone="inverse"
                    placeholder="Write a clear post title"
                  />
                </FormUI.FormField>

                <FormUI.FormField id="category" label="Category" error={errors.category?.message} required tone="inverse">
                  <SelectUI.Select
                    value={selectedCategory}
                    onValueChange={(value) => setValue('category', value as BlogCategory, { shouldDirty: true, shouldValidate: true })}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue>{selectedCategory || 'Choose a category'}</SelectUI.SelectValue>
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      {categoryOptions.map((category) => (
                        <SelectUI.SelectItem key={category} value={category}>
                          {category}
                        </SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                </FormUI.FormField>

                <FormUI.FormField id="slug" label="Slug" error={errors.slug?.message} required tone="inverse">
                  <Input
                    id="slug"
                    {...register('slug')}
                    hasError={Boolean(errors.slug)}
                    tone="inverse"
                    placeholder="write-a-clean-url-slug"
                  />
                </FormUI.FormField>

                <FormUI.FormField id="excerpt" label="Excerpt" error={errors.excerpt?.message} required tone="inverse">
                  <textarea
                    id="excerpt"
                    {...register('excerpt')}
                    rows={4}
                    placeholder="Add a short summary that explains why the article matters."
                    className="w-full resize-none rounded-xl border border-black/10 bg-[#F7F4EC] px-4 py-3 text-sm text-[#04090C] outline-none transition-colors placeholder:text-black/40 focus:ring-2 focus:ring-[#29E68C]"
                  />
                </FormUI.FormField>

                <div className="border-t border-black/10 pt-5">
                  <LayoutUI.Column gap="gap-5">
                    <FormUI.FormField id="authorName" label="Author Name" error={errors.authorName?.message} required tone="inverse">
                      <Input
                        id="authorName"
                        {...register('authorName')}
                        icon={<Icons.User size={18} />}
                        hasError={Boolean(errors.authorName)}
                        tone="inverse"
                        placeholder="Jane Contributor"
                      />
                    </FormUI.FormField>

                    <FormUI.FormField id="authorEmail" label="Author Email" error={errors.authorEmail?.message} required tone="inverse">
                      <Input
                        id="authorEmail"
                        type="email"
                        {...register('authorEmail')}
                        icon={<Icons.Mail size={18} />}
                        hasError={Boolean(errors.authorEmail)}
                        tone="inverse"
                        placeholder="jane@example.com"
                      />
                    </FormUI.FormField>

                    <FormUI.FormField id="role" label="Author Role" error={errors.role?.message} required tone="inverse">
                      <Input
                        id="role"
                        {...register('role')}
                        hasError={Boolean(errors.role)}
                        tone="inverse"
                        placeholder="Admin"
                      />
                    </FormUI.FormField>
                  </LayoutUI.Column>
                </div>
              </LayoutUI.Column>
            </CardUI.CardContent>
          </CardUI.Card>
        </div>
      </FormUI.FormRoot>
    </LayoutUI.Column>
  );
}
