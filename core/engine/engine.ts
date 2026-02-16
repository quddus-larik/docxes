import * as fs from "node:fs/promises";
import * as path from "node:path";
import { parse } from "./parser";
import { compile } from "./compiler";
import { generateTOC } from "./ast/toc";
import { PluginSystem } from "./plugins/plugin-system";
import { CacheManager } from "./cache/cache-manager";
import { EngineConfig, DocxesOutput, NavItem } from "./types";

export class DocxesEngine {
  private pluginSystem: PluginSystem;
  private cache: CacheManager;
  private config: EngineConfig;
  private docsDir: string;

  constructor(config: EngineConfig = {}) {
    this.config = config;
    this.pluginSystem = new PluginSystem(config.plugins || []);
    this.cache = new CacheManager();
    this.docsDir = path.resolve(process.cwd(), config.documentsPath || "content/docs");
  }

  private isHidden(name: string): boolean {
    return name.startsWith(".") || name.includes(".hidden");
  }

  private async fileExists(p: string): Promise<boolean> {
    try {
      await fs.access(p);
      return true;
    } catch {
      return false;
    }
  }

  async getVersions(): Promise<string[]> {
    try {
      const items = await fs.readdir(this.docsDir);
      const versions: string[] = [];
      for (const item of items) {
        if (this.isHidden(item)) continue;
        const fullPath = path.join(this.docsDir, item);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) versions.push(item);
      }
      return versions.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, "") || "0");
        const numB = parseInt(b.replace(/\D/g, "") || "0");
        return numA - numB;
      });
    } catch (e) {
      return [];
    }
  }

  async getAllDocs(version: string): Promise<DocFile[]> {
    const versionDir = path.join(this.docsDir, version);
    if (!(await this.fileExists(versionDir))) return [];

    const docs: DocFile[] = [];
    const walkDir = async (dir: string, slug: string[] = []) => {
      const files = await fs.readdir(dir);
      for (const file of files) {
        if (this.isHidden(file)) continue;
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          await walkDir(filePath, [...slug, file]);
        } else if (file.endsWith(".mdx") || file.endsWith(".md")) {
          const fileSlug = file.replace(/\.(mdx?|md)$/, "");
          if (fileSlug !== "main") {
            // We don't process everything here for performance, just metadata
            docs.push({
              slug: [...slug, fileSlug],
              path: filePath,
              title: fileSlug,
              content: null,
              rawContent: "",
              headings: [],
            });
          }
        }
      }
    };

    await walkDir(versionDir);
    return docs;
  }

  async getDoc(version: string, slug: string[]): Promise<DocFile | null> {
    const fileName = slug[slug.length - 1];
    const dirPath = slug.slice(0, -1).length
      ? path.join(this.docsDir, version, ...slug.slice(0, -1))
      : path.join(this.docsDir, version);

    const candidates = [
      path.join(dirPath, `${fileName}.mdx`),
      path.join(dirPath, `${fileName}.md`),
      path.join(dirPath, fileName, "main.mdx"),
      path.join(dirPath, fileName, "main.md"),
    ];

    let file: string | null = null;
    for (const cand of candidates) {
      if (await this.fileExists(cand)) {
        file = cand;
        break;
      }
    }

    if (!file) return null;

    const fileContent = await fs.readFile(file, "utf-8");
    const cacheKey = `${version}/${slug.join("/")}`;
    const output = await this.process(fileContent, cacheKey);

    return {
      slug,
      path: file,
      title: output.metadata.frontmatter?.title || slug[slug.length - 1],
      description: output.metadata.frontmatter?.description,
      content: output.compiled,
      rawContent: fileContent,
      headings: output.metadata.toc.map((item) => ({
        level: item.depth,
        text: item.title,
        id: item.id,
      })),
    };
  }

  async getNavigation(version: string): Promise<NavItem[]> {
    const versionDir = path.join(this.docsDir, version);
    if (!(await this.fileExists(versionDir))) return [];

    const slugify = (name: string) => name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

    const processDir = async (dir: string, parentSlugs: string[] = []): Promise<NavItem[]> => {
      const entries = await fs.readdir(dir);
      const metaMap = new Map<string, { title: string; order: number; isDir: boolean; isClickable: boolean }>();

      for (const entry of entries) {
        if (this.isHidden(entry)) continue;
        const fullPath = path.join(dir, entry);
        const stat = await fs.stat(fullPath);
        const name = entry.replace(/\.(mdx|md)$/, "");

        let existing = metaMap.get(name) || { title: name, order: 999, isDir: false, isClickable: false };

        if (stat.isDirectory()) {
          existing.isDir = true;
          const mainMdx = path.join(fullPath, "main.mdx");
          const mainMd = path.join(fullPath, "main.md");
          const mainFile = (await this.fileExists(mainMdx)) ? mainMdx : (await this.fileExists(mainMd)) ? mainMd : null;

          if (mainFile) {
            const { frontmatter, content } = await parse(await fs.readFile(mainFile, "utf-8"));
            existing.title = frontmatter.title || existing.title;
            existing.order = frontmatter.order ?? existing.order;
            if (content.trim().length > 0) existing.isClickable = true;
          }
        } else if (entry.endsWith(".md") || entry.endsWith(".mdx")) {
          if (name === "main" || name === "index") continue;
          const { frontmatter, content } = await parse(await fs.readFile(fullPath, "utf-8"));
          existing.title = frontmatter.title || existing.title;
          existing.order = frontmatter.order ?? existing.order;
          if (content.trim().length > 0) existing.isClickable = true;
        }
        metaMap.set(name, existing);
      }

      const items: NavItem[] = [];
      const sorted = [...metaMap.entries()].sort((a, b) => a[1].order - b[1].order || a[0].localeCompare(b[0]));

      for (const [name, meta] of sorted) {
        const slug = slugify(name);
        const hrefPath = [...parentSlugs, slug].join("/");
        if (meta.isDir) {
          const children = await processDir(path.join(dir, name), [...parentSlugs, slug]);
          if (children.length > 0) {
            items.push({
              title: meta.title,
              href: meta.isClickable ? `/docs/${version}/${hrefPath}` : undefined,
              items: children,
            });
          }
        } else {
          items.push({
            title: meta.title,
            href: meta.isClickable ? `/docs/${version}/${hrefPath}` : undefined,
          });
        }
      }
      return items;
    };

    return processDir(versionDir);
  }

  async getSearchIndex(): Promise<SearchResult[]> {
    const versions = await this.getVersions();
    const allDocs: SearchResult[] = [];

    const walkDir = async (dir: string, version: string, slug: string[] = []): Promise<SearchResult[]> => {
      const docs: SearchResult[] = [];
      const files = await fs.readdir(dir);

      for (const file of files) {
        if (this.isHidden(file)) continue;
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          docs.push(...(await walkDir(filePath, version, [...slug, file])));
        } else if (file.endsWith(".mdx") || file.endsWith(".md")) {
          const fileSlug = file.replace(/\.(mdx?|md)$/, "");
          if (fileSlug === "main" || fileSlug === "index") continue;

          const fileContent = await fs.readFile(filePath, "utf-8");
          const { frontmatter, content } = await parse(fileContent);

          const plainContent = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

          let keywords = frontmatter.keywords || [];
          if (typeof keywords === "string") keywords = keywords.split(",").map((k: string) => k.trim());

          docs.push({
            id: `${version}-${[...slug, fileSlug].join("/")}`,
            title: frontmatter.title || fileSlug.replace(/-/g, " "),
            description: frontmatter.description,
            keywords: keywords,
            content: plainContent,
            version,
            href: `/docs/${version}/${[...slug, fileSlug].join("/")}`,
          });
        }
      }
      return docs;
    };

    for (const version of versions) {
      allDocs.push(...(await walkDir(path.join(this.docsDir, version), version)));
    }
    return allDocs;
  }

  async search(query: string, options: { version?: string; limit?: number } = {}): Promise<SearchResult[]> {
    const index = await this.getSearchIndex();
    const q = query.toLowerCase();
    
    let results = index.filter((doc) => {
      if (options.version && options.version !== "all" && doc.version !== options.version) return false;
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.description?.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q) ||
        doc.keywords?.some((k) => k.toLowerCase().includes(q))
      );
    });

    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  async process(source: string, key: string): Promise<DocxesOutput> {
    const configHash = Buffer.from(JSON.stringify(this.config.mdx || {})).toString("base64").slice(0, 8);
    const fullKey = `${key}_${configHash}`;

    const cached = await this.cache.get(fullKey);
    if (cached) return cached;

    // 1. Hook: beforeParse
    const preProcessedSource = await this.pluginSystem.runHook("beforeParse", source);

    // 2. Parse
    const { content, frontmatter, ast } = await parse(preProcessedSource);

    // 3. Generate Metadata (TOC, etc.)
    const toc = await generateTOC(content);

    // 4. Compile
    const compiled = await compile(content, {
      mdx: this.config.mdx,
    });

    const output: DocxesOutput = {
      compiled,
      metadata: {
        frontmatter,
        toc,
        ast,
      },
    };

    // 5. Cache
    await this.cache.set(fullKey, output);

    // 6. Hook: afterRender (optional, using compiled code as string)
    if (this.pluginSystem) {
      // Just an example of how one might use the hook
    }

    return output;
  }
}
