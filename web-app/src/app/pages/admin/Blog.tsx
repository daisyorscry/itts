import { useState } from 'react';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import * as SelectUI from '@components/ui/select';
import { DataPagination } from '@components/ui/pagination';
import { SearchField } from '@components/ui/search';
import { DataTable, type DataTableColumn } from '@components/ui/table';
import { Text } from '@components/ui/text';
import { useListAdminBlogPosts, useUpdateBlogPostStatus } from '@feature/blog/hooks';
import { type BlogPost, type BlogPostListResponse, type BlogPostStatus } from '@feature/blog/types';
import { useAuthStore } from '@store/auth.store';
import { hasPermission } from '@utility/permissions';
import { formatDateTime } from '@utility/date';

function createBlogColumns({
  isUpdating,
  canReview,
  onStatusChange,
}: {
  isUpdating: boolean;
  canReview: boolean;
  onStatusChange: (post: BlogPost, status: BlogPostStatus) => void;
}): Array<DataTableColumn<BlogPost>> {
  return [
    {
      id: 'article',
      header: 'Article',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse" className="max-w-[320px] truncate" title={row.title}>
            {row.title}
          </Text>
          <Text variant="muted-inverse" size="xs">{row.slug}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'author',
      header: 'Author',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse">{row.author_name}</Text>
          <Text variant="muted-inverse" size="xs">{row.author_email}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      cell: ({ row }) => <Text variant="muted-inverse">{row.category}</Text>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <SelectUI.Select
          value={row.status}
          onValueChange={(value) => onStatusChange(row, value as BlogPostStatus)}
          disabled={isUpdating || !canReview}
        >
          <SelectUI.SelectTrigger appearance="admin" className="h-auto min-w-32 rounded-lg px-2 py-1.5">
            <SelectUI.SelectValue>{row.status}</SelectUI.SelectValue>
          </SelectUI.SelectTrigger>
          <SelectUI.SelectContent appearance="admin">
            <SelectUI.SelectItem value="in_review">In Review</SelectUI.SelectItem>
            <SelectUI.SelectItem value="draft">Draft</SelectUI.SelectItem>
            <SelectUI.SelectItem value="published">Published</SelectUI.SelectItem>
            <SelectUI.SelectItem value="rejected">Rejected</SelectUI.SelectItem>
            <SelectUI.SelectItem value="archived">Archived</SelectUI.SelectItem>
          </SelectUI.SelectContent>
        </SelectUI.Select>
      ),
    },
    {
      id: 'createdAt',
      header: 'Created',
      cell: ({ row }) => <Text variant="muted-inverse">{formatDateTime(row.created_at)}</Text>,
    },
  ];
}

export function AdminBlog() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BlogPostStatus | ''>('in_review');
  const canReview = hasPermission(user, 'blogs:review');
  const canCreateDirectly = hasPermission(user, 'blogs:create');

  const { data, isLoading, error } = useListAdminBlogPosts({
    page,
    page_size: pageSize,
    search: search || undefined,
    status: status || undefined,
  });
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateBlogPostStatus();

  const response: BlogPostListResponse | null = data ?? null;
  const posts = response?.data ?? [];
  const postColumns = createBlogColumns({
    isUpdating,
    canReview,
    onStatusChange: (post, nextStatus) => {
      updateStatus({
        id: post.id,
        payload: {
          status: nextStatus,
        },
      });
    },
  });

  return (
    <LayoutUI.Column gap="gap-8">
      <LayoutUI.Row justify="justify-between" align="items-center" className="gap-4 max-md:flex-col max-md:items-start">
        <LayoutUI.Column gap="gap-2">
          <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold md:text-4xl">
            Blog Review Queue
          </Text>
          <Text variant="muted-inverse">
            {canReview
              ? 'Review blog posts and decide which ones get published.'
              : 'Track the blog posts you created and wait for admin approval.'}
          </Text>
        </LayoutUI.Column>
        <Button onClick={() => navigate('/admin/blog/create')} variant="accent" size="form">
          <Icons.Plus />
          Create Blog
        </Button>
      </LayoutUI.Row>

      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-xl:flex-col max-xl:items-start">
        {typeof response?.total === 'number' ? (
          <Text variant="muted-inverse" className="shrink-0 md:pt-2">
            Showing {(page - 1) * (response?.page_size ?? pageSize) + 1} to{' '}
            {Math.min(page * (response?.page_size ?? pageSize), response.total)} of {response.total} posts
          </Text>
        ) : null}

        <CardUI.Card tone="inverse" border={false} className="w-full flex-1">
          <CardUI.CardContent>
            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
              <SearchField
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search blog posts"
              />
              <SelectUI.Select
                value={status || 'all'}
                onValueChange={(value) => {
                  setStatus(value === 'all' ? '' : (value as BlogPostStatus));
                  setPage(1);
                }}
              >
                <SelectUI.SelectTrigger appearance="admin">
                  <SelectUI.SelectValue>{status || 'All statuses'}</SelectUI.SelectValue>
                </SelectUI.SelectTrigger>
                <SelectUI.SelectContent appearance="admin">
                  <SelectUI.SelectItem value="all">All statuses</SelectUI.SelectItem>
                  <SelectUI.SelectItem value="in_review">In Review</SelectUI.SelectItem>
                  <SelectUI.SelectItem value="draft">Draft</SelectUI.SelectItem>
                  <SelectUI.SelectItem value="published">Published</SelectUI.SelectItem>
                  <SelectUI.SelectItem value="rejected">Rejected</SelectUI.SelectItem>
                  <SelectUI.SelectItem value="archived">Archived</SelectUI.SelectItem>
                </SelectUI.SelectContent>
              </SelectUI.Select>
            </LayoutUI.Container>
          </CardUI.CardContent>
        </CardUI.Card>
      </LayoutUI.Row>

      {isLoading ? (
        <CardUI.Card tone="inverse">
          <CardUI.CardContent>
            <Text variant="muted-inverse">Loading submissions...</Text>
          </CardUI.CardContent>
        </CardUI.Card>
      ) : null}

      {!isLoading && error ? (
        <CardUI.Card tone="inverse">
          <CardUI.CardContent>
            <LayoutUI.Row gap="gap-3" align="items-center">
              <Icons.AlertCircle className="size-5 text-red-500" />
              <Text variant="inverse">Failed to load blog posts.</Text>
            </LayoutUI.Row>
          </CardUI.CardContent>
        </CardUI.Card>
      ) : null}

      {!isLoading && !error && response ? (
        <LayoutUI.Column>
          <CardUI.Card tone="inverse" className="overflow-hidden">
            <DataTable
              data={posts}
              columns={postColumns}
              rowKey="id"
              emptyMessage="No blog posts found."
            />
          </CardUI.Card>

          {!canReview ? (
            <Text variant="muted-inverse" size="sm" className="mt-3">
              Status changes are only available to admins with blog review access.
            </Text>
          ) : null}

          <DataPagination
            pagination={response}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
          />
        </LayoutUI.Column>
      ) : null}
    </LayoutUI.Column>
  );
}
