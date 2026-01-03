import matter from 'gray-matter'
import fs from 'fs'
import path from 'path'

const GITHUB_REPO = 'daisyorscry/itts'
const GITHUB_BRANCH = 'main'
const DOCS_PATH = 'docs'

// Local docs path for development
const LOCAL_DOCS_PATH = '/Users/daisy/Documents/ITTS-Community/docs'

// Determine if we're in production
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

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

// ========================================
// GITHUB FUNCTIONS (Production)
// ========================================

// Fetch file content from GitHub raw URL
async function fetchFileFromGitHub(path: string): Promise<string | null> {
  try {
    const url = `${GITHUB_RAW_URL}/${path}.mdx`
    const response = await fetch(url, {
      // Cache for 1 hour in production, no cache in development
      ...(IS_PRODUCTION
        ? { next: { revalidate: 3600 } }
        : { cache: 'no-store' as RequestCache }
      )
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
async function fetchDirectoryFromGitHub(filePath: string = ''): Promise<GitHubContent[]> {
  try {
    const url = filePath ? `${GITHUB_API_URL}/${filePath}` : GITHUB_API_URL
    const response = await fetch(url, {
      // Cache for 1 hour in production, no cache in development
      ...(IS_PRODUCTION
        ? { next: { revalidate: 3600 } }
        : { cache: 'no-store' as RequestCache }
      ),
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!response.ok) {
      return []
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching directory from GitHub: ${filePath}`, error)
    return []
  }
}

// ========================================
// LOCAL FILESYSTEM FUNCTIONS (Development)
// ========================================

// Read file content from local filesystem
async function readFileFromLocal(filePath: string): Promise<string | null> {
  try {
    const fullPath = path.join(LOCAL_DOCS_PATH, `${filePath}.mdx`)

    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    return fileContents
  } catch (error) {
    console.error(`Error reading file from local: ${filePath}`, error)
    return null
  }
}

// Read directory contents from local filesystem
async function readDirectoryFromLocal(dirPath: string = ''): Promise<string[]> {
  try {
    const fullPath = dirPath ? path.join(LOCAL_DOCS_PATH, dirPath) : LOCAL_DOCS_PATH

    if (!fs.existsSync(fullPath)) {
      return []
    }

    const entries = fs.readdirSync(fullPath, { withFileTypes: true })
    return entries.map(entry => entry.name)
  } catch (error) {
    console.error(`Error reading directory from local: ${dirPath}`, error)
    return []
  }
}

// Check if path is a directory in local filesystem
function isDirectoryLocal(dirPath: string): boolean {
  try {
    const fullPath = path.join(LOCAL_DOCS_PATH, dirPath)
    return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()
  } catch (error) {
    return false
  }
}

// ========================================
// UNIFIED FUNCTIONS (Auto-switch based on environment)
// ========================================

export async function getDocBySlug(slug: string[]) {
  const filePath = slug.join('/')

  let fileContents: string | null

  if (IS_PRODUCTION) {
    fileContents = await fetchFileFromGitHub(filePath)
  } else {
    fileContents = await readFileFromLocal(filePath)
  }

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
  const docs: DocMetadata[] = []

  if (IS_PRODUCTION) {
    // GitHub approach
    const contents = await fetchDirectoryFromGitHub(dir)

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
  } else {
    // Local filesystem approach
    const entries = await readDirectoryFromLocal(dir)

    for (const entry of entries) {
      const entryPath = dir ? `${dir}/${entry}` : entry

      if (isDirectoryLocal(entryPath)) {
        const subDocs = await getAllDocs(entryPath)
        docs.push(...subDocs)
      } else if (entry.endsWith('.mdx')) {
        const filePath = dir ? `${dir}/${entry.replace(/\.mdx$/, '')}` : entry.replace(/\.mdx$/, '')
        const fileContents = await readFileFromLocal(filePath)

        if (fileContents) {
          const { data } = matter(fileContents)
          docs.push({
            ...(data as DocFrontmatter),
            slug: filePath,
          })
        }
      }
    }
  }

  return docs
}

export async function getDocModules() {
  if (IS_PRODUCTION) {
    // GitHub approach
    const contents = await fetchDirectoryFromGitHub()
    return contents
      .filter((item) => item.type === 'dir')
      .map((item) => item.name)
  } else {
    // Local filesystem approach
    const entries = await readDirectoryFromLocal()
    return entries.filter((entry) => isDirectoryLocal(entry))
  }
}
