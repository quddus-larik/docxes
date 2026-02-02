import fs from "fs/promises"
import path from "path"
import matter from "gray-matter"
import type { SearchableDoc } from "@/types/types"
import { XMeta } from "@/x-meta.config"

const DOCS_DIR = path.join(process.cwd(), XMeta.documentsPath)

function isHidden(name: string): boolean {
  return name.includes(".hidden")
}

function extractPlainText(htmlContent: string): string {
  return htmlContent
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim()
}

async function walkDir(dir: string, version: string, slug: string[] = []): Promise<SearchableDoc[]> {
  const docs: SearchableDoc[] = []
  
  try {
    const files = await fs.readdir(dir)

    await Promise.all(files.map(async (file) => {
      if (file.startsWith(".") || isHidden(file)) return

      const filePath = path.join(dir, file)
      const stat = await fs.stat(filePath)

      if (stat.isDirectory()) {
        const nestedDocs = await walkDir(filePath, version, [...slug, file])
        docs.push(...nestedDocs)
      } else if (file.endsWith(".mdx") || file.endsWith(".md")) {
        const fileSlug = file.replace(/\.(mdx?|md)$/, "")

        // Skip main/index files, they're folder entry points
        if (fileSlug === "main" || fileSlug === "index") return

        try {
          const fileContent = await fs.readFile(filePath, "utf-8")
          const { data, content } = matter(fileContent)

          // Extract plain text from content
          const plainContent = extractPlainText(content)

          docs.push({
            id: `${version}-${[...slug, fileSlug].join("/")}`,
            title: data.title || fileSlug.replace(/-/g, " "),
            description: data.description,
            keywords: data.keywords || [],
            content: plainContent,
            version,
            href: `/docs/${version}/${[...slug, fileSlug].join("/")}`,
          })
        } catch (error) {
          console.error(`Error indexing ${filePath}:`, error)
        }
      }
    }))
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error)
  }

  return docs
}

export async function indexAllDocs(): Promise<SearchableDoc[]> {
  const docs: SearchableDoc[] = []

  try {
    await fs.access(DOCS_DIR)
  } catch {
    return docs
  }

  const items = await fs.readdir(DOCS_DIR)
  
  // Identify versions (directories)
  const versions: string[] = []
  
  await Promise.all(items.map(async (item) => {
      if (isHidden(item)) return;
      const stat = await fs.stat(path.join(DOCS_DIR, item));
      if (stat.isDirectory()) versions.push(item);
  }));

  const versionDocs = await Promise.all(versions.map((version) => {
    const versionDir = path.join(DOCS_DIR, version)
    return walkDir(versionDir, version)
  }))

  versionDocs.forEach(d => docs.push(...d))

  console.log(`Indexed ${docs.length} documents`)
  return docs
}

