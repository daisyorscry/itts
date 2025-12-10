import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const docsDirectory = path.join(process.cwd(), 'content/docs')

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

export function getDocBySlug(slug: string[]) {
  const fullPath = path.join(docsDirectory, ...slug) + '.mdx'

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    frontmatter: data as DocFrontmatter,
    content,
    slug: slug.join('/'),
  }
}

export function getAllDocs(dir: string = ''): DocMetadata[] {
  const fullPath = path.join(docsDirectory, dir)

  if (!fs.existsSync(fullPath)) {
    return []
  }

  const files = fs.readdirSync(fullPath)
  const docs: DocMetadata[] = []

  for (const file of files) {
    const filePath = path.join(fullPath, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      docs.push(...getAllDocs(path.join(dir, file)))
    } else if (file.endsWith('.mdx')) {
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data } = matter(fileContents)
      const slug = path.join(dir, file.replace(/\.mdx$/, ''))

      docs.push({
        ...(data as DocFrontmatter),
        slug,
      })
    }
  }

  return docs
}

export function getDocModules() {
  const modulesPath = docsDirectory

  if (!fs.existsSync(modulesPath)) {
    return []
  }

  const modules = fs.readdirSync(modulesPath)
  return modules.filter((module) => {
    const modulePath = path.join(modulesPath, module)
    return fs.statSync(modulePath).isDirectory()
  })
}
