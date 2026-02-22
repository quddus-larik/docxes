import * as fs from "node:fs/promises";
import * as path from "node:path";
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto'; // Add this import
import { parse } from "./parser";
import { compile } from "./compiler";
import { generateTOC } from "./ast/toc";
import { PluginSystem } from "./plugins/plugin-system";
import { CacheManager } from "./cache/cache-manager";
import { EngineConfig, DocxesOutput, NavItem, SearchResult, Manifest } from "./types";
import { DocFile } from "./types";

export class DocxesEngine {
  private pluginSystem: PluginSystem;
  private cache: CacheManager;
  private config: EngineConfig;
  private docsDir: string;
  private manifest: Manifest | null = null;
  private manifestPath: string;

  constructor(config: EngineConfig = {}) {
    this.config = config;
    this.pluginSystem = new PluginSystem(config.plugins || []);
    this.cache = new CacheManager();
    this.docsDir = path.resolve(process.cwd(), config.documentsPath || "content/docs");
    this.manifestPath = path.resolve(process.cwd(), ".docxes/manifest.json");
    
    // In production, try to load the manifest immediately
    if (process.env.NODE_ENV === "production") {
      this.loadManifestSync();
    }
  }

  private loadManifestSync(): void {
    try {
      // We use a sync check or similar if needed, but for now we'll just try to load it
      // In a real serverless env, we might want to ensure this is loaded once
      const fsSync = require('node:fs');
      if (fsSync.existsSync(this.manifestPath)) {
        const data = fsSync.readFileSync(this.manifestPath, 'utf-8');
        this.manifest = JSON.parse(data);
        console.log("[DocxesEngine] Production manifest loaded successfully.");
      }
    } catch (e) {
      console.warn("[DocxesEngine] Failed to load production manifest:", e);
    }
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

  async build(): Promise<void> {
    console.log("[DocxesEngine] Starting scalable pre-compilation build...");
    const versions = await this.getVersions();
    const manifest: Manifest = {
      versions,
      navigation: {},
      docs: {},
      searchIndex: [],
      generatedAt: new Date().toISOString(),
    };
    
    // Ensure .docxes/data directory exists for atomic storage
    const dataDir = path.resolve(process.cwd(), ".docxes/data");
    if (!(await this.fileExists(dataDir))) {
      await fs.mkdir(dataDir, { recursive: true });
    }

    // Process versions concurrently
    await Promise.all(versions.map(async (version) => {
      console.log(`[DocxesEngine] Processing version: ${version}`);

      const versionDir = path.join(this.docsDir, version);
      
      // Build navigation for this version
      manifest.navigation[version] = await this.getNavigation(version);

      const walkAndBuild = async (dir: string, slugs: string[] = []) => {
        const entries = await fs.readdir(dir);
        const processingPromises: Promise<any>[] = [];

        for (const entry of entries) {
          if (this.isHidden(entry)) continue;
          const fullPath = path.join(dir, entry);
          const stat = await fs.stat(fullPath);
          const name = entry.replace(/\.(mdx|md)$/, "");
          const currentSlugs = [...slugs, name];
          
          if (stat.isDirectory()) {
            processingPromises.push(walkAndBuild(fullPath, currentSlugs));
          } else if (entry.endsWith(".md") || entry.endsWith(".mdx")) {
            if (name !== "main" && name !== "index") {
              processingPromises.push(
                (async () => {
                  const doc = await this.getDoc(version, currentSlugs);
                  if (doc) {
                    const docKey = `${version}/${currentSlugs.join("/")}`;
                    const docFilePath = path.join(dataDir, `${docKey}.mjs`);
                    
                    // Ensure subdirectories exist in atomic storage
                    await fs.mkdir(path.dirname(docFilePath), { recursive: true });
                    
                    // Save individual doc as an ESM module (Truly "no JSON phase")
                    const { content, ...metadata } = doc;
                    const docModule = `
export const metadata = ${JSON.stringify(metadata, null, 2)};
export const code = ${JSON.stringify(content)};
export default { ...metadata, content: code };
`;
                    await fs.writeFile(docFilePath, docModule);
                    
                    // Keep ONLY metadata in manifest for fast access, EXCLUDE content/rawContent
                    manifest.docs[docKey] = metadata as any;
                  }
                })()
              );
            }
          }
        }
        await Promise.all(processingPromises);
      };

      await walkAndBuild(versionDir);
    }));

    // Generate search index
    manifest.searchIndex = await this.getSearchIndex();
    
    // Ensure .docxes directory exists
    const docxesDir = path.dirname(this.manifestPath);
    if (!(await this.fileExists(docxesDir))) {
      await fs.mkdir(docxesDir, { recursive: true });
    }

    // Write manifest
    await fs.writeFile(this.manifestPath, JSON.stringify(manifest, null, 2));
    this.manifest = manifest;

    // Export public search index for static environments
    const publicSearchPath = path.resolve(process.cwd(), "public/search-index.json");
    await fs.writeFile(publicSearchPath, JSON.stringify(manifest.searchIndex));
    
    // Generate sitemap if enabled
    if (this.config.sitemap?.enabled) {
      await this.generateSitemap(manifest);
    }
    
    console.log(`[DocxesEngine] Scalable build complete! Manifest generated at ${this.manifestPath}`);
    console.log(`[DocxesEngine] Data stored in ${dataDir}`);
  }

  private async generateSitemap(manifest: Manifest): Promise<void> {
    console.log("[DocxesEngine] Generating sitemap.xml...");
    const siteUrl = this.config.sitemap?.siteUrl || "http://localhost:3000";
    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/docs</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;

    for (const version of manifest.versions) {
      // Version index
      xml += `
  <url>
    <loc>${siteUrl}/docs/${version}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

      // Documents
      const docs = Object.values(manifest.docs).filter(d => d.slug[0] === version || (d.slug.length > 0 && version === manifest.versions[0]));
      for (const doc of docs) {
        xml += `
  <url>
    <loc>${siteUrl}/docs/${version}/${doc.slug.join("/")}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    }

    xml += "\n</urlset>";

    const sitemapPath = path.resolve(process.cwd(), "public/sitemap.xml");
    await fs.writeFile(sitemapPath, xml);
    console.log(`[DocxesEngine] Sitemap generated at ${sitemapPath}`);
  }

  async getVersions(): Promise<string[]> {
    if (this.manifest) return this.manifest.versions;

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
    if (this.manifest) {
      return Object.values(this.manifest.docs).filter(d => d.slug[0] === version || (d.slug.length > 0 && version === this.manifest?.versions[0])); // Simple filter for demo
    }

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
            docs.push({
              slug: [...slug, fileSlug],
              path: filePath,
              title: fileSlug,
              content: "",
              rawContent: "",
              plainText: "",
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
    const key = `${version}/${slug.join("/")}`;
    
    // 1. Try manifest first (will only have metadata now)
    if (this.manifest && this.manifest.docs[key] && (this.manifest.docs[key] as any).content) {
      return this.manifest.docs[key];
    }

    // 2. Try atomic file system (.docxes/data/...) using dynamic import
    const atomicPath = path.resolve(process.cwd(), `.docxes/data/${key}.mjs`);
    if (await this.fileExists(atomicPath)) {
      try {
        // Use relative path for Next.js/Turbopack compatibility
        // The engine is in core/engine/engine.ts, data is in .docxes/data/
        const relativePath = `../../.docxes/data/${key}.mjs`;
        const module = await import(relativePath);
        if (module.default) {
          console.log(`[DocxesEngine] Cache HIT (mjs): ${key}`);
          return module.default;
        }
      } catch (e) {
        // If relative import fails, try absolute as fallback
        try {
          const fileUrl = pathToFileURL(atomicPath).href;
          const module = await import(fileUrl);
          if (module.default) return module.default;
        } catch (e2) {
          console.warn(`[DocxesEngine] Failed to import pre-compiled doc "${key}":`, e);
        }
      }
    }

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

    let fileContent: string;
    try {
      fileContent = await fs.readFile(file, "utf-8");
    } catch (e: any) {
      console.error(`[DocxesEngine] Failed to read documentation file "${file}":`, e);
      throw new Error(`Failed to read documentation file "${file}": ${e.message}`);
    }
    
    const output = await this.process(fileContent, key);

    let keywords = output.metadata.frontmatter?.keywords || [];
    if (typeof keywords === "string") keywords = keywords.split(",").map((k: string) => k.trim());

    console.log(`[DocxesEngine] Loaded doc: ${version}/${slug.join("/")}`);

    return {
      slug,
      path: file,
      title: output.metadata.frontmatter?.title || slug[slug.length - 1],
      description: output.metadata.frontmatter?.description,
      order: output.metadata.frontmatter?.order,
      keywords: keywords,
      content: output.compiled,
      rawContent: fileContent,
      plainText: output.metadata.plainText || "",
      headings: output.metadata.toc.map((item) => ({
        level: item.depth,
        text: item.title,
        id: item.id,
      })),
    };
  }

  async getNavigation(version: string): Promise<NavItem[]> {
    if (this.manifest && this.manifest.navigation[version]) {
      return this.manifest.navigation[version];
    }

    console.log(`[DocxesEngine] Building navigation for version: ${version}`);
    const versionDir = path.join(this.docsDir, version);
    if (!(await this.fileExists(versionDir))) return [];

    // Use custom slugify from config if available, otherwise use default
    const customSlugify = this.config.slugify || ((name: string) => name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"));

    const processDir = async (dir: string, parentSlugs: string[] = []): Promise<NavItem[]> => {
      const entries = await fs.readdir(dir);
      const items: NavItem[] = [];

      for (const entry of entries) {
        if (this.isHidden(entry)) continue;
        const fullPath = path.join(dir, entry);
        const stat = await fs.stat(fullPath);
        const name = entry.replace(/\.(mdx|md)$/, "");
        const slug = customSlugify(name);
        const currentSlugs = [...parentSlugs, slug];

        if (stat.isDirectory()) {
          const mainDoc = await this.getDoc(version, currentSlugs);
          const children = await processDir(fullPath, currentSlugs);
          
          const isClickable = mainDoc && mainDoc.plainText.trim().length > 0;

          if (children.length > 0 || mainDoc) {
            items.push({
              title: mainDoc?.title || name,
              href: isClickable ? `/docs/${version}/${currentSlugs.join("/")}` : undefined,
              items: children.length > 0 ? children : undefined,
              order: mainDoc?.order ?? 999,
            });
          }
        } else if (entry.endsWith(".md") || entry.endsWith(".mdx")) {
          if (name === "main" || name === "index") continue;
          const doc = await this.getDoc(version, currentSlugs);
          if (doc) {
            const isClickable = doc.plainText.trim().length > 0;
            items.push({
              title: doc.title,
              href: isClickable ? `/docs/${version}/${currentSlugs.join("/")}` : undefined,
              order: doc.order ?? 999,
            });
          }
        }
      }

      return items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));
    };

    const nav = await processDir(versionDir);
    console.log(`[DocxesEngine] Navigation built: ${nav.length} top-level items`);
    return nav;
  }

  async getSearchIndex(
    includeFields: Array<"title" | "description" | "keywords" | "content"> = [
      "title",
      "description",
      "keywords",
      "content",
    ]
  ): Promise<SearchResult[]> {
    if (this.manifest) {
      return this.manifest.searchIndex;
    }

    console.log(`[DocxesEngine] Generating search index...`);
    const versions = await this.getVersions();
    const allDocsPromises: Promise<SearchResult | null>[] = []; // Array to hold promises

    for (const version of versions) {
      const docsMetadata = await this.getAllDocs(version); // Gets basic metadata
      for (const docInfo of docsMetadata) {
        // Push a promise for each getDoc call
        allDocsPromises.push(
          (async () => {
            try {
              const doc = await this.getDoc(version, docInfo.slug);
              if (doc) {
                let keywords = doc.keywords || [];
                if (typeof keywords === "string")
                  keywords = (keywords as string).split(",").map((k: string) => k.trim());

                const result: SearchResult = {
                  id: `${version}-${doc.slug.join("/")}`,
                  version,
                  href: `/docs/${version}/${doc.slug.join("/")}`,
                };

                if (includeFields.includes("title")) result.title = doc.title;
                if (includeFields.includes("description")) result.description = doc.description;
                if (includeFields.includes("keywords")) result.keywords = keywords;
                if (includeFields.includes("content")) result.content = doc.plainText;

                return result;
              }
            } catch (e: any) {
              console.error(`[DocxesEngine] Error getting doc for search index "${version}/${docInfo.slug.join("/")}":`, e);
            }
            return null; // Return null if doc is not found or error occurs
          })()
        );
      }
    }
    
    // Resolve all promises concurrently and filter out nulls
    const results = await Promise.all(allDocsPromises);
    const allDocs = results.filter((result): result is SearchResult => result !== null);

    console.log(`[DocxesEngine] Search index generated: ${allDocs.length} total documents`);
    return allDocs;
  }

  async process(source: string, key: string): Promise<DocxesOutput> {
    const CACHE_VERSION = "v10"; // Increment for highlighter adjustment
    const mdxConfigHash = createHash('sha256').update(JSON.stringify(this.config.mdx || {})).digest('hex').slice(0, 8);
    const sourceHash = createHash('sha256').update(source).digest('hex').slice(0, 12);
    
    const pluginNamesHash = createHash('sha256').update(JSON.stringify(this.config.plugins?.map(p => p.name) || [])).digest('hex').slice(0, 8);
    const slugifyHash = createHash('sha256').update(this.config.slugify ? 'custom' : 'default').digest('hex').slice(0, 8);

    const fullKey = `${CACHE_VERSION}_${key}_${mdxConfigHash}_${pluginNamesHash}_${slugifyHash}_source_${sourceHash}`;

    const cached = await this.cache.get(fullKey);
    if (cached) {
      console.log(`[DocxesEngine] Cache HIT: ${key}`);
      return cached;
    }

    console.log(`[DocxesEngine] Cache MISS: ${key} (Compiling...)`);

    try {
      // 1. Hook: beforeParse
      const preProcessedSource = await this.pluginSystem.runHook("beforeParse", source);

      // 2. Parse
      let { content, frontmatter, ast } = await parse(preProcessedSource);

      // 2a. Hook: afterParse
      const afterParseResult = await this.pluginSystem.runHook("afterParse", { content, frontmatter, ast });
      content = afterParseResult.content;
      frontmatter = afterParseResult.frontmatter;
      ast = afterParseResult.ast;

      // 3. Generate Metadata (TOC, etc.)
      const toc = await generateTOC(content);
      const plainText = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

      // 4. Hook: beforeCompile
      const preCompiledContent = await this.pluginSystem.runHook("beforeCompile", content);

      // 5. Compile
      let compiled = await compile(preCompiledContent, {
        mdx: this.config.mdx,
      });

      // 5a. Hook: afterRender
      compiled = await this.pluginSystem.runHook("afterRender", compiled);

      const output: DocxesOutput = {
        compiled,
        metadata: {
          frontmatter,
          toc,
          ast,
          plainText,
        },
      };

      // 6. Cache
      await this.cache.set(fullKey, output);

      return output;
    } catch (e: any) {
      console.error(`[DocxesEngine] Error processing document "${key}":`, e);
      throw new Error(`Failed to process document "${key}": ${e.message}`);
    }
  }
}
