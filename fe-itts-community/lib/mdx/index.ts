import matter from 'gray-matter'

const GITHUB_REPO = 'daisyorscry/itts'
const GITHUB_BRANCH = 'main'
const DOCS_PATH = 'docs'

// GitHub API base URLs
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${DOCS_PATH}`
const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${DOCS_PATH}`

export interface DocFrontmatter {
  title: string
  description: string
  level?: string
  duration?: string
  tags?: string[]
}

export interface DocMetadata extends DocFrontmatter {
  slug: string
}

interface GitHubContent {
  name: string
  path: string
  type: 'file' | 'dir'
  download_url?: string
}

// Fetch file content from GitHub raw URL
async function fetchFileFromGitHub(path: string): Promise<string | null> {
  try {
    const url = `${GITHUB_RAW_URL}/${path}.mdx`
    const response = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      return null
    }

    return await response.text()
  } catch (error) {
    console.error(`Error fetching file from GitHub: ${path}`, error)
    return null
  }
}

// Fetch directory contents from GitHub API
async function fetchDirectoryFromGitHub(path: string = ''): Promise<GitHubContent[]> {
  try {
    const url = path ? `${GITHUB_API_URL}/${path}` : GITHUB_API_URL
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!response.ok) {
      return []
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching directory from GitHub: ${path}`, error)
    return []
  }
}

export async function getDocBySlug(slug: string[]) {
  const filePath = slug.join('/')
  const fileContents = await fetchFileFromGitHub(filePath)

  if (!fileContents) {
    return null
  }

  const { data, content } = matter(fileContents)

  return {
    frontmatter: data as DocFrontmatter,
    content,
    slug: slug.join('/'),
  }
}

export async function getAllDocs(dir: string = ''): Promise<DocMetadata[]> {
  const contents = await fetchDirectoryFromGitHub(dir)
  const docs: DocMetadata[] = []

  for (const item of contents) {
    if (item.type === 'dir') {
      const subPath = dir ? `${dir}/${item.name}` : item.name
      const subDocs = await getAllDocs(subPath)
      docs.push(...subDocs)
    } else if (item.name.endsWith('.mdx')) {
      const filePath = dir ? `${dir}/${item.name.replace(/\.mdx$/, '')}` : item.name.replace(/\.mdx$/, '')
      const fileContents = await fetchFileFromGitHub(filePath)

      if (fileContents) {
        const { data } = matter(fileContents)
        docs.push({
          ...(data as DocFrontmatter),
          slug: filePath,
        })
      }
    }
  }

  return docs
}

export async function getDocModules() {
  const contents = await fetchDirectoryFromGitHub()

  return contents
    .filter((item) => item.type === 'dir')
    .map((item) => item.name)
}
