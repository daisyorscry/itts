import type { JSONContent } from '@tiptap/core';
import type { ApiResponse } from '../../utility/response';
import type {
  BlogPost,
  BlogPostListResponse,
  BlogSubmission,
  BlogSubmissionListResponse,
  CreateBlogSubmissionRequest,
  ListBlogPostsParams,
  ListBlogSubmissionsParams,
  UpdateBlogSubmissionStatusRequest,
} from './types';

const now = new Date().toISOString();

function createDocument(paragraphs: string[], options?: { codeBlock?: { language: string; code: string }; image?: string }): JSONContent {
  const content: JSONContent[] = paragraphs.map((paragraph) => ({
    type: 'paragraph',
    content: [{ type: 'text', text: paragraph }],
  }));

  if (options?.codeBlock) {
    content.splice(2, 0, {
      type: 'codeBlock',
      attrs: { language: options.codeBlock.language },
      content: [{ type: 'text', text: options.codeBlock.code }],
    });
  }

  if (options?.image) {
    content.splice(1, 0, {
      type: 'image',
      attrs: {
        src: options.image,
        alt: 'Inline article image',
      },
    });
  }

  return {
    type: 'doc',
    content,
  };
}

const blogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    slug: 'document-campus-projects-like-engineers',
    title: 'How to Document a Campus Project So It Becomes a Strong Engineering Portfolio Piece',
    excerpt:
      'A practical structure for turning class work into a readable technical article with clear context, execution, and lessons learned.',
    content: createDocument(
      [
        'Most student projects fail as portfolio pieces for one simple reason: the work may be real, but the documentation is vague. A strong engineering writeup does not start by claiming impact. It starts by explaining the problem space clearly.',
        'The most useful blog posts from a community are specific. What were you trying to build, what constraints did you face, what broke first, and what changed after iteration? If those sections are clear, the article already becomes valuable.',
        'This ITTS blog is designed to hold exactly that kind of writing. Not polished marketing copy, but practical notes, build logs, architecture decisions, deployment lessons, and reflections that another contributor can actually reuse.',
        'A good default structure is simple: context, problem, implementation choices, result, and lessons learned. If a contributor can explain those five parts honestly, the article is publishable and worth reading.',
      ],
      {
        codeBlock: {
          language: 'bash',
          code: 'npm run build\nnpm run dev',
        },
      },
    ),
    author: 'ITTS Community',
    role: 'Editorial Starter',
    date: '2026-03-28T09:00:00.000Z',
    readTime: '7 min read',
    category: 'Career',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    featured: true,
  },
  {
    id: 'blog-2',
    slug: 'deploy-react-without-overcomplicating-pipeline',
    title: 'Deploying a Simple React App Without Overcomplicating the Pipeline',
    excerpt:
      'A beginner-friendly writeup on keeping deployment practical, clean, and easy to explain to the next contributor.',
    content: createDocument([
      'Early deployment setups often become too clever too fast. A small app does not need a maze of stages, scripts, and environment assumptions before it can ship.',
      'The better approach is to start from the minimum reliable flow: build, verify output, deploy to one environment, and document the exact steps. Complexity should be added only after there is a real operational reason.',
      'For contributors writing blog posts, that makes a strong technical story. Readers do not just want the final setup. They want to understand why simpler choices were good enough at the current stage.',
    ]),
    author: 'Naufal Ardiansyah',
    role: 'Programming Track',
    date: '2026-03-24T09:00:00.000Z',
    readTime: '6 min read',
    category: 'Programming',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  },
  {
    id: 'blog-3',
    slug: 'lessons-from-first-secure-login-flow',
    title: 'What I Learned After Building My First Secure Login Flow',
    excerpt:
      'An honest breakdown of validation mistakes, auth edge cases, and what changed after a proper review.',
    content: createDocument([
      'Authentication features usually look finished before they are actually safe. The surface may work, but the edge cases tend to reveal the real quality of the implementation.',
      'Writing about those mistakes is useful. It helps other contributors avoid repeating common problems around validation, state handling, and access boundaries.',
      'This kind of article fits the ITTS blog well because it turns practical debugging into shared knowledge instead of private frustration.',
    ]),
    author: 'Raka Prasetyo',
    role: 'DevSecOps Track',
    date: '2026-03-21T09:00:00.000Z',
    readTime: '8 min read',
    category: 'DevSecOps',
    image:
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  },
  {
    id: 'blog-4',
    slug: 'network-lab-troubleshooting-checklist',
    title: 'Troubleshooting Network Labs Without Guessing',
    excerpt:
      'A simple workflow for checking topology, IP planning, and device configuration before assuming the worst.',
    content: createDocument([
      'A lot of network troubleshooting becomes messy because people jump to packet-level assumptions before checking the fundamentals. Topology, addressing, and basic interface state still solve many of the first failures.',
      'Good technical writing can turn a troubleshooting routine into a repeatable checklist. That is often more useful to the community than a broad theoretical article.',
    ]),
    author: 'Dimas Saputra',
    role: 'Networking Track',
    date: '2026-03-19T09:00:00.000Z',
    readTime: '5 min read',
    category: 'Networking',
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  },
  {
    id: 'blog-5',
    slug: 'community-writeups-over-personal-branding',
    title: 'Why Community Writeups Matter More Than Perfect Personal Branding',
    excerpt:
      'Strong writing is not about sounding senior. It is about leaving useful notes for the next builder in the room.',
    content: createDocument([
      'A useful community blog does not need every contributor to sound polished. It needs contributors to be concrete, accurate, and generous with what they learned.',
      'That is the reason to build both a contributor flow and an admin review flow from the start. The system should make it easier to publish good knowledge, not just polished knowledge.',
    ]),
    author: 'ITTS Team',
    role: 'Community',
    date: '2026-03-16T09:00:00.000Z',
    readTime: '4 min read',
    category: 'Community',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  },
];

let blogSubmissions: BlogSubmission[] = [
  {
    id: 'submission-1',
    title: 'Building My First Internal Admin Dashboard',
    slug: 'building-my-first-internal-admin-dashboard',
    excerpt: 'A reflection on modeling states, handling empty data, and keeping admin screens readable.',
    content: createDocument([
      'I started from raw tables and quickly realized that the hardest part was not rendering rows. It was defining the states clearly: loading, empty, error, and success. Once that structure was stable, the rest of the page became easier to reason about.',
    ]),
    authorName: 'Mira Anjani',
    authorEmail: 'mira@example.com',
    role: 'Contributor',
    category: 'Programming',
    status: 'submitted',
    createdAt: now,
  },
  {
    id: 'submission-2',
    title: 'Notes From Hardening a Small Deployment Pipeline',
    slug: 'notes-from-hardening-a-small-deployment-pipeline',
    excerpt: 'A short operational writeup about reducing manual mistakes in a simple deployment process.',
    content: createDocument([
      'The first improvement was not adding more tools. It was documenting which assumptions existed in the deployment script and which environment values were required. That alone removed a lot of friction.',
    ]),
    authorName: 'Fikri Rahman',
    authorEmail: 'fikri@example.com',
    role: 'Mentor',
    category: 'DevSecOps',
    status: 'in_review',
    notes: 'Good direction. Needs a clearer ending section.',
    createdAt: now,
  },
];

function createMeta() {
  return {
    requestId: 'local-blog-api',
    timestamp: new Date().toISOString(),
  };
}

function wrapResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    meta: createMeta(),
  };
}

function createApiError(message: string) {
  return {
    response: {
      data: {
        error: {
          code: 'BLOG_ERROR',
          message,
        },
        meta: createMeta(),
      },
    },
  };
}

function paginate<T>(items: T[], page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  return {
    data: paged,
    total: items.length,
    page,
    page_size: pageSize,
    total_pages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

function normalizeSearch(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

export async function listPublicBlogPostsApi(params?: ListBlogPostsParams): Promise<ApiResponse<BlogPostListResponse>> {
  const search = normalizeSearch(params?.search);

  const filtered = blogPosts.filter((post) => {
    const matchesCategory = !params?.category || post.category === params.category;
    const matchesSearch =
      !search ||
      post.title.toLowerCase().includes(search) ||
      post.excerpt.toLowerCase().includes(search) ||
      post.author.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  return wrapResponse(paginate(filtered, params?.page ?? 1, params?.page_size ?? 10));
}

export async function getPublicBlogPostBySlugApi(slug: string): Promise<ApiResponse<BlogPost>> {
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    throw createApiError('Blog post not found');
  }

  return wrapResponse(post);
}

export async function createBlogSubmissionApi(payload: CreateBlogSubmissionRequest): Promise<ApiResponse<BlogSubmission>> {
  const submission: BlogSubmission = {
    id: `submission-${blogSubmissions.length + 1}`,
    title: payload.title,
    slug: payload.slug,
    excerpt: payload.excerpt,
    content: payload.content,
    authorName: payload.authorName,
    authorEmail: payload.authorEmail,
    role: payload.role,
    category: payload.category,
    status: 'submitted',
    createdAt: new Date().toISOString(),
  };

  blogSubmissions = [submission, ...blogSubmissions];

  return wrapResponse(submission);
}

export async function listBlogSubmissionsApi(params?: ListBlogSubmissionsParams): Promise<ApiResponse<BlogSubmissionListResponse>> {
  const search = normalizeSearch(params?.search);

  const filtered = blogSubmissions.filter((submission) => {
    const matchesStatus = !params?.status || submission.status === params.status;
    const matchesSearch =
      !search ||
      submission.title.toLowerCase().includes(search) ||
      submission.authorName.toLowerCase().includes(search) ||
      submission.authorEmail.toLowerCase().includes(search);

    return matchesStatus && matchesSearch;
  });

  return wrapResponse(paginate(filtered, params?.page ?? 1, params?.page_size ?? 10));
}

export async function updateBlogSubmissionStatusApi(
  id: string,
  payload: UpdateBlogSubmissionStatusRequest,
): Promise<ApiResponse<BlogSubmission>> {
  const existing = blogSubmissions.find((submission) => submission.id === id);

  if (!existing) {
    throw createApiError('Blog submission not found');
  }

  const updated: BlogSubmission = {
    ...existing,
    status: payload.status,
    notes: payload.notes ?? existing.notes,
  };

  blogSubmissions = blogSubmissions.map((submission) => (submission.id === id ? updated : submission));

  return wrapResponse(updated);
}
