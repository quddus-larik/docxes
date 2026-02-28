import * as fs from "node:fs/promises";
import * as path from "node:path";
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { parse } from "./parser";
import { compile } from "./compiler";
import { generateTOC } from "./ast/toc";
import { PluginSystem } from "./plugins/plugin-system";
import { CacheManager } from "./cache/cache-manager";
import { FileHashTracker } from "./cache/file-hash-tracker";
import { EngineConfig, DocxesOutput, NavItem, SearchResult, Manifest, VersionMetadata } from "./types";
import { DocFile } from "./types";

export class DocxesEngine {
  private pluginSystem: PluginSystem;
  private cache: CacheManager;
  private hashTracker: FileHashTracker;
  private config: EngineConfig;
  private docsDir: string;
  private manifest: Manifest | null = null;
  private manifestPath: string;
  // Cache for metadata to avoid re-reading docs for navigation
  private metadataCache: Map<string, Partial<DocFile>> = new Map();

  constructor(config: EngineConfig = {}) {
    this.config = config;
    this.pluginSystem = new PluginSystem(config.plugins || []);
    this.cache = new CacheManager();
    this.hashTracker = new FileHashTracker();
    this.docsDir = path.resolve(process.cwd(), config.contentDir || "content/docs");
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

  async getVersionMetadata(version: string): Promise<{ title?: string; description?: string } | null> {
    if (this.manifest && this.manifest.versionMetadata?.[version]) {
      return this.manifest.versionMetadata[version];
    }

    const versionDir = path.join(this.docsDir, version);
    const mainCandidates = [
      path.join(versionDir, "main.mdx"),
      path.join(versionDir, "main.md"),
      path.join(versionDir, "index.mdx"),
      path.join(versionDir, "index.md"),
    ];

    let mainFile: string | null = null;
    for (const cand of mainCandidates) {
      if (await this.fileExists(cand)) {
        mainFile = cand;
        break;
      }
    }

    if (!mainFile) return null;

    try {
      const content = await fs.readFile(mainFile, "utf-8");
      const { frontmatter } = await parse(content);
      return {
        title: frontmatter.title,
        description: frontmatter.description,
      };
    } catch (e) {
      console.error(`[DocxesEngine] Error reading version metadata for ${version}:`, e);
      return null;
    }
  }

  async build(incremental: boolean = true): Promise<void> {
    console.log(`[DocxesEngine] Starting ${incremental ? 'incremental' : 'full'} pre-compilation build...`);
    
    // Load file hash tracker for incremental builds
    if (incremental) {
      await this.hashTracker.load();
    }
    
    const versions = await this.getVersions();
    const manifest: Manifest = {
      versions,
      versionMetadata: {},
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
      
      // Get version metadata (from main.mdx)
      const vMetadata = await this.getVersionMetadata(version);
      if (vMetadata) {
        manifest.versionMetadata![version] = vMetadata;
      }

      // Build navigation for this version (uses manifest metadata, not re-parsing)
      manifest.navigation[version] = await this.getNavigation(version);

      const walkAndBuild = async (dir: string, slugs: string[] = []) => {
        const processingPromises: Promise<any>[] = [];
        
        // Use readdirSync with withFileTypes for batched syscalls
        let entries: any[] = [];
        try {
          entries = await fs.readdir(dir, { withFileTypes: true });
        } catch (e) {
          console.warn(`[DocxesEngine] Failed to read directory ${dir}:`, e);
          return;
        }

        for (const entry of entries) {
          if (this.isHidden(entry.name)) continue;
          const fullPath = path.join(dir, entry.name);
          const name = entry.name.replace(/\.(mdx|md)$/, "");
          const currentSlugs = [...slugs, name];
          
          if (entry.isDirectory()) {
            processingPromises.push(walkAndBuild(fullPath, currentSlugs));
          } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
            if (name !== "main" && name !== "index") {
              processingPromises.push(
                (async () => {
                  const fileHash = await this.hashTracker.getFileHash(fullPath);
                  const docKey = `${version}/${currentSlugs.join("/")}`;
                  
                  // Skip if file hasn't changed (incremental build)
                  if (incremental && !this.hashTracker.hasChanged(fullPath, fileHash)) {
                    console.log(`[DocxesEngine] Skipped (unchanged): ${docKey}`);
                    // Still need metadata in manifest
                    const existingDoc = await this.getDocFromStorage(version, currentSlugs);
                    if (existingDoc) {
                      const { content, ...metadata } = existingDoc;
                      manifest.docs[docKey] = metadata as any;
                    }
                    return;
                  }
                  
                  const doc = await this.getDoc(version, currentSlugs);
                  if (doc) {
                    const docFilePath = path.join(dataDir, `${docKey}.mjs`);
                    
                    // Ensure subdirectories exist in atomic storage
                    await fs.mkdir(path.dirname(docFilePath), { recursive: true });
                    
                    // Save individual doc as an ESM module
                    const { content, ...metadata } = doc;
                    const docModule = `
export const metadata = ${JSON.stringify(metadata, null, 2)};
export const code = ${JSON.stringify(content)};
export default { ...metadata, content: code };
`;
                    await fs.writeFile(docFilePath, docModule);
                    this.hashTracker.updateHash(fullPath, fileHash);
                    
                    // Keep ONLY metadata in manifest for fast access
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

    // Generate search index (optimized with streaming)
    manifest.searchIndex = await this.getSearchIndex();
    
    // Ensure .docxes directory exists
    const docxesDir = path.dirname(this.manifestPath);
    if (!(await this.fileExists(docxesDir))) {
      await fs.mkdir(docxesDir, { recursive: true });
    }

    // Write manifest
    await fs.writeFile(this.manifestPath, JSON.stringify(manifest, null, 2));
    this.manifest = manifest;

    // Save file hash tracker for next build
    if (incremental) {
      await this.hashTracker.save();
    }

    // Export public search index for static environments
    const publicSearchPath = path.resolve(process.cwd(), "public/search-index.json");
    await fs.writeFile(publicSearchPath, JSON.stringify(manifest.searchIndex));
    
    // Generate sitemap if enabled
    if (this.config.sitemap?.enabled) {
      await this.generateSitemap(manifest);
    }
    
    console.log(`[DocxesEngine] Build complete! Manifest generated at ${this.manifestPath}`);
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
      const items = await fs.readdir(this.docsDir, { withFileTypes: true });
      const versions: string[] = [];
      for (const item of items) {
        if (this.isHidden(item.name)) continue;
        if (item.isDirectory()) versions.push(item.name);
      }
      
      // Sort with semver-aware comparison
      return versions.sort((a, b) => {
        // Try semver comparison first
        const semverA = this.parseSemver(a);
        const semverB = this.parseSemver(b);
        
        if (semverA && semverB) {
          // Both are semver - compare numerically
          const cmp = semverA.major - semverB.major || 
                      semverA.minor - semverB.minor || 
                      semverA.patch - semverB.patch;
          if (cmp !== 0) return cmp;
        }
        
        // Fallback to string comparison (case-insensitive)
        return a.localeCompare(b);
      });
    } catch (e) {
      return [];
    }
  }

  private parseSemver(version: string): { major: number; minor: number; patch: number } | null {
    // Match semver pattern: v1.2.3 or 1.2.3 (with optional suffix)
    const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)/);
    if (match) {
      return {
        major: parseInt(match[1], 10),
        minor: parseInt(match[2], 10),
        patch: parseInt(match[3], 10),
      };
    }
    return null;
  }

  async getVersionsMetadata(): Promise<Record<string, VersionMetadata>> {
    if (this.manifest && this.manifest.versionMetadata) {
      return this.manifest.versionMetadata;
    }

    const versions = await this.getVersions();
    const metadata: Record<string, VersionMetadata> = {};

    for (const v of versions) {
      const vMeta = await this.getVersionMetadata(v);
      if (vMeta) {
        metadata[v] = vMeta;
      }
    }

    return metadata;
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

    // 2. In PRODUCTION: Try atomic file system (.docxes/data/...) using dynamic import
    // In DEVELOPMENT: Skip atomic cache to enable hot reloading
    if (process.env.NODE_ENV === "production") {
      const atomicPath = path.resolve(process.cwd(), `.docxes/data/${key}.mjs`);
      if (await this.fileExists(atomicPath)) {
        try {
          const relativePath = `../../.docxes/data/${key}.mjs`;
          const module = await import(relativePath);
          if (module.default) {
            console.log(`[DocxesEngine] Cache HIT (mjs): ${key}`);
            return module.default;
          }
        } catch (e) {
          try {
            const fileUrl = pathToFileURL(atomicPath).href;
            const module = await import(fileUrl);
            if (module.default) return module.default;
          } catch (e2) {
            console.warn(`[DocxesEngine] Failed to import pre-compiled doc "${key}":`, e);
          }
        }
      }
    }

    // 3. Try in-memory cache (but with development awareness)
    // In development, skip cache for source files to enable hot reload
    const cacheKey = `${createHash("sha256").update(key).digest("hex").slice(0, 12)}`;
    if (process.env.NODE_ENV !== "development") {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        console.log(`[DocxesEngine] Cache HIT (memory): ${key}`);
        return {
          slug,
          path: "",
          title: (cached.metadata as any).title || "",
          description: (cached.metadata as any).description,
          order: (cached.metadata as any).order,
          keywords: (cached.metadata as any).keywords,
          content: cached.compiled,
          rawContent: "",
          plainText: (cached.metadata as any).plainText || "",
          headings: (cached.metadata as any).toc?.map((item: any) => ({
            level: item.depth,
            text: item.title,
            id: item.id,
          })) || [],
        };
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

  private async getDocFromStorage(version: string, slug: string[]): Promise<DocFile | null> {
    const key = `${version}/${slug.join("/")}`;
    const atomicPath = path.resolve(process.cwd(), `.docxes/data/${key}.mjs`);
    
    if (await this.fileExists(atomicPath)) {
      try {
        const relativePath = `../../.docxes/data/${key}.mjs`;
        const module = await import(relativePath);
        if (module.default) {
          return module.default;
        }
      } catch (e) {
        try {
          const fileUrl = pathToFileURL(atomicPath).href;
          const module = await import(fileUrl);
          if (module.default) return module.default;
        } catch (e2) {
          return null;
        }
      }
    }
    return null;
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
      const items: NavItem[] = [];
      
      // Use readdirSync with withFileTypes for batched syscalls
      let entries: any[] = [];
      try {
        entries = await fs.readdir(dir, { withFileTypes: true });
      } catch (e) {
        console.warn(`[DocxesEngine] Failed to read directory ${dir}:`, e);
        return [];
      }

      for (const entry of entries) {
        if (this.isHidden(entry.name)) continue;
        const fullPath = path.join(dir, entry.name);
        const name = entry.name.replace(/\.(mdx|md)$/, "");
        const slug = customSlugify(name);
        const currentSlugs = [...parentSlugs, slug];

        if (entry.isDirectory()) {
          // Load metadata from manifest or cache instead of re-parsing
          const mainDoc = await this.getDocMetadata(version, currentSlugs);
          const children = await processDir(fullPath, currentSlugs);
          
          const isClickable = mainDoc && mainDoc.plainText && mainDoc.plainText.trim().length > 0;

          if (children.length > 0 || mainDoc) {
            items.push({
              title: mainDoc?.title || name,
              href: isClickable ? `/docs/${version}/${currentSlugs.join("/")}` : undefined,
              items: children.length > 0 ? children : undefined,
              order: mainDoc?.order ?? 999,
            });
          }
        } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
          if (name === "main" || name === "index") continue;
          
          // Load metadata from manifest or cache instead of re-parsing
          const doc = await this.getDocMetadata(version, currentSlugs);
          if (doc) {
            const isClickable = doc.plainText && doc.plainText.trim().length > 0;
            items.push({
              title: doc.title as string,
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

  private async getDocMetadata(version: string, slug: string[]): Promise<Partial<DocFile> | null> {
    const key = `${version}/${slug.join("/")}`;
    
    // Try cache first
    if (this.metadataCache.has(key)) {
      return this.metadataCache.get(key) || null;
    }
    
    // Try manifest metadata (already loaded)
    if (this.manifest && this.manifest.docs[key]) {
      const docMeta = this.manifest.docs[key] as any;
      this.metadataCache.set(key, docMeta);
      return docMeta;
    }

    // Try loading from atomic file system without parsing content
    if (process.env.NODE_ENV !== "development") {
      const atomicPath = path.resolve(process.cwd(), `.docxes/data/${key}.mjs`);
      if (await this.fileExists(atomicPath)) {
        try {
          const relativePath = `../../.docxes/data/${key}.mjs`;
          const module = await import(relativePath);
          if (module.metadata) {
            const metadata = module.metadata;
            this.metadataCache.set(key, metadata);
            return metadata;
          }
        } catch (e) {
          // Fallback to absolute path
          try {
            const fileUrl = pathToFileURL(atomicPath).href;
            const module = await import(fileUrl);
            if (module.metadata) {
              this.metadataCache.set(key, module.metadata);
              return module.metadata;
            }
          } catch (e2) {
            console.warn(`[DocxesEngine] Failed to load metadata for "${key}":`, e);
          }
        }
      }
    }

    // Fallback: Load minimal metadata from file without full compilation
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

    try {
      const fileContent = await fs.readFile(file, "utf-8");
      const { frontmatter, content } = await parse(fileContent);
      const plainText = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
      
      const metadata: Partial<DocFile> = {
        slug,
        path: file,
        title: frontmatter.title || slug[slug.length - 1],
        description: frontmatter.description,
        order: frontmatter.order,
        keywords: frontmatter.keywords || [],
        plainText,
      };
      
      this.metadataCache.set(key, metadata);
      return metadata;
    } catch (e) {
      console.warn(`[DocxesEngine] Failed to load metadata for "${key}":`, e);
      return null;
    }
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
    const allDocsPromises: Promise<SearchResult | null>[] = [];

    for (const version of versions) {
      const docsMetadata = await this.getAllDocs(version);
      for (const docInfo of docsMetadata) {
        allDocsPromises.push(
          (async () => {
            try {
              // Load doc only if content is needed, otherwise use metadata
              const doc = includeFields.includes("content") 
                ? await this.getDoc(version, docInfo.slug)
                : await this.getDocMetadata(version, docInfo.slug);
              
              if (doc) {
                let keywords = doc.keywords || [];
                if (typeof keywords === "string")
                  keywords = (keywords as string).split(",").map((k: string) => k.trim());

                const slugPath = docInfo.slug.join("/");
                const result: SearchResult = {
                  id: `${version}-${slugPath}`,
                  version,
                  href: `/docs/${version}/${slugPath}`,
                };

                if (includeFields.includes("title")) result.title = doc.title;
                if (includeFields.includes("description")) result.description = doc.description;
                if (includeFields.includes("keywords")) result.keywords = keywords;
                if (includeFields.includes("content")) result.content = doc.plainText;

                return result;
              }
            } catch (e: any) {
              console.error(`[DocxesEngine] Error indexing doc "${version}/${docInfo.slug.join("/")}":`, e.message);
            }
            return null;
          })()
        );
      }
    }
    
    const results = await Promise.all(allDocsPromises);
    const allDocs = results.filter((result): result is SearchResult => result !== null);

    console.log(`[DocxesEngine] Search index generated: ${allDocs.length} documents`);
    return allDocs;
  }

  async process(source: string, key: string): Promise<DocxesOutput> {
    const CACHE_VERSION = "v1";
    const mdxConfigHash = createHash('sha256').update(JSON.stringify(this.config.mdx || {})).digest('hex').slice(0, 8);
    const sourceHash = createHash('sha256').update(source).digest('hex').slice(0, 12);
    
    const pluginNamesHash = createHash('sha256').update(JSON.stringify(this.config.plugins?.map(p => p.name) || [])).digest('hex').slice(0, 8);
    const slugifyHash = createHash('sha256').update(this.config.slugify ? 'custom' : 'default').digest('hex').slice(0, 8);

    const fullKey = `${CACHE_VERSION}_${key}_${mdxConfigHash}_${pluginNamesHash}_${slugifyHash}_source_${sourceHash}`;

    // In development, skip cache to enable hot reloading
    // In production, use cache for performance
    if (process.env.NODE_ENV !== "development") {
      const cached = await this.cache.get(fullKey);
      if (cached) {
        console.log(`[DocxesEngine] Cache HIT: ${key}`);
        return cached;
      }
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

      // 6. Cache only in production
      if (process.env.NODE_ENV !== "development") {
        await this.cache.set(fullKey, output);
      }

      return output;
    } catch (e: any) {
      console.error(`[DocxesEngine] Error processing document "${key}":`, e);
      throw new Error(`Failed to process document "${key}": ${e.message}`);
    }
  }
}
