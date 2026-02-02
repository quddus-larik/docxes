import fs from "fs/promises"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import remarkHtml from "remark-html"
import type { DocFile, DocMeta, DocHeading, DocNavItem } from "@/types/types"
import { XMeta } from "@/x-meta.config"

const DOCS_DIR = path.join(process.cwd(), XMeta.documentsPath)

function isHidden(name: string): boolean {
  return name.includes(".hidden")
}

// Check if file/dir exists
async function exists(path: string): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}

// Extract headings from markdown
function extractHeadings(content: string): DocHeading[] {
  const headingRegex = /^#{2,4}\s+(.+)$/gm
  const headings: DocHeading[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[1]
    const id = text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
    const level = match[0].indexOf(" ") // Count # characters
    headings.push({ level, text, id })
  }

  return headings
}

// Parse markdown file and extract metadata + content
async function parseDocFile(filePath: string): Promise<Partial<DocFile>> {
  const fileContent = await fs.readFile(filePath, "utf-8")
  const { data, content } = matter(fileContent)

  // Convert markdown to HTML
  const processedContent = await remark().use(remarkHtml).process(content)

  const htmlContent = String(processedContent)
  const headings = extractHeadings(content)

  return {
    content: htmlContent,
    headings,
    metadata: data as DocMeta,
  }
}

// Get all docs for a specific version
export async function getAllDocs(version: string): Promise<DocFile[]> {
  const versionDir = path.join(DOCS_DIR, version)

  if (!(await exists(versionDir))) {
    return []
  }

  const docs: DocFile[] = []

  async function walkDir(dir: string, slug: string[] = []) {
    const files = await fs.readdir(dir)

    for (const file of files) {
      if (isHidden(file)) continue

      const filePath = path.join(dir, file)
      const stat = await fs.stat(filePath)

      if (stat.isDirectory()) {
        await walkDir(filePath, [...slug, file])
      } else if (file.endsWith(".mdx") || file.endsWith(".md")) {
        const fileSlug = file.replace(/\.(mdx?|md)$/, "")
        if (fileSlug !== "main") {
          docs.push({
            slug: [...slug, fileSlug],
            path: filePath,
            title: fileSlug,
            content: "",
            rawContent: "",
            headings: [],
          })
        }
      }
    }
  }

  await walkDir(versionDir)
  return docs
}

// Get a specific doc file
export async function getDoc(version: string, slug: string[]): Promise<DocFile | null> {
  const fileName = slug[slug.length - 1]
  const dirPath = slug.slice(0, -1).length
    ? path.join(DOCS_DIR, version, ...slug.slice(0, -1))
    : path.join(DOCS_DIR, version)

  const filePath = path.join(dirPath, `${fileName}.mdx`)
  const fallbackPath = path.join(dirPath, `${fileName}.md`)
  const indexPath = path.join(dirPath, fileName, "main.mdx")
  const indexFallbackPath = path.join(dirPath, fileName, "main.md")

  let file: string | null = null

  if (await exists(filePath)) {
    file = filePath
  } else if (await exists(fallbackPath)) {
    file = fallbackPath
  } else if (await exists(indexPath)) {
    file = indexPath
  } else if (await exists(indexFallbackPath)) {
    file = indexFallbackPath
  }

  if (!file) return null

  // Read raw content
  const fileContent = await fs.readFile(file, "utf-8")
  const { data, content } = matter(fileContent)

  // Parse for headings if needed
  const parsed = await parseDocFile(file)

  return {
    slug,
    path: file,
    title: data?.title || slug[slug.length - 1],
    description: data?.description,
    content: parsed.content || "",      // HTML or serialized if you use remark-html
    rawContent: content,                // RAW MDX/Markdown for manual serialization
    headings: parsed.headings || []
  }
}

// Generate navigation structure from file system
function slugify(name: string) {
  return name
    .toLowerCase()           // lowercase
    .replace(/\s+/g, "-")    // spaces → hyphens
    .replace(/[^\w-]/g, "")  // remove non-word chars
}

export async function generateNavigation(version: string): Promise<DocNavItem[]> {
  const versionDir = path.join(DOCS_DIR, version)
  if (!(await exists(versionDir))) return []

  async function processDir(
    dir: string,
    parentSlugs: string[] = []
  ): Promise<DocNavItem[]> {
    const entries = (await fs.readdir(dir)).sort()
    const items: DocNavItem[] = []

    const metaMap = new Map<
      string,
      {
        title: string
        order: number
        isDir: boolean
        hasMainFile: boolean
      }
    >()

    for (const entry of entries) {
      if (entry.startsWith(".") || isHidden(entry)) continue

      const fullPath = path.join(dir, entry)
      const stat = await fs.stat(fullPath)

      /* ------------------ DIRECTORY ------------------ */
      if (stat.isDirectory()) {
        if (!(await hasValidMarkdownFiles(fullPath))) continue

        const mainMdx = path.join(fullPath, "main.mdx")
        const mainMd = path.join(fullPath, "main.md")
        const hasMainFile = (await exists(mainMdx)) || (await exists(mainMd))

        let title = entry
        let order = 999

        if (hasMainFile) {
          const mainFile = (await exists(mainMdx)) ? mainMdx : mainMd
          try {
            const content = await fs.readFile(mainFile, "utf-8")
            const { data } = matter(content)
            title = data.title || title
            order = data.order ?? order
          } catch {}
        }

        metaMap.set(entry, {
          title,
          order,
          isDir: true,
          hasMainFile,
        })
      }

      /* ------------------ FILE ------------------ */
      else if (entry.endsWith(".md") || entry.endsWith(".mdx")) {
        const name = entry.replace(/\.(mdx|md)$/, "")
        if (name === "main" || name === "index") continue

        let title = name
        let order = 999

        try {
          const content = await fs.readFile(fullPath, "utf-8")
          const { data } = matter(content)
          title = data.title || title
          order = data.order ?? order
        } catch {}

        metaMap.set(name, {
          title,
          order,
          isDir: false,
          hasMainFile: false,
        })
      }
    }

    const sorted = [...metaMap.entries()].sort(
      (a, b) => a[1].order - b[1].order
    )

    for (const [name, meta] of sorted) {
      const slug = slugify(name)
      const hrefPath = [...parentSlugs, slug].join("/")

      /* ------------------ DIRECTORY ITEM ------------------ */
      if (meta.isDir) {
        const childDir = path.join(dir, name)
        const children = await processDir(childDir, [...parentSlugs, slug])

        if (!children.length) continue

        items.push({
          title: meta.title,
          href: meta.hasMainFile
            ? `/docs/${version}/${hrefPath}`
            : undefined,
          items: children,
          hasMainFile: meta.hasMainFile,
        })
      }

      /* ------------------ FILE ITEM ------------------ */
      else {
        items.push({
          title: meta.title,
          href: `/docs/${version}/${hrefPath}`,
        })
      }
    }

    return items
  }

  return processDir(versionDir)
}


// Get available versions
export async function getVersions(): Promise<string[]> {
  if (!(await exists(DOCS_DIR))) {
    return []
  }

  const files = await fs.readdir(DOCS_DIR)
  const versions = []

  for (const file of files) {
      if (isHidden(file)) continue
      const stat = await fs.stat(path.join(DOCS_DIR, file))
      if (stat.isDirectory()) {
          versions.push(file)
      }
  }
  
  return versions.sort()
}

async function hasValidMarkdownFiles(dir: string): Promise<boolean> {
  const files = await fs.readdir(dir)
  for (const file of files) {
    if (isHidden(file) || file.startsWith(".")) continue
    const filePath = path.join(dir, file)
    const stat = await fs.stat(filePath)
    if (stat.isDirectory()) {
      if (await hasValidMarkdownFiles(filePath)) return true
    } else {
        if (file.endsWith(".mdx") || file.endsWith(".md")) return true
    }
  }
  return false
}
