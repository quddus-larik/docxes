import { cache } from "react";
import { DocxesEngine } from "../engine/engine";
import { NavItem, DocFile, SearchResult } from "../engine/types";

let globalEngine: DocxesEngine | null = null;

/**
 * Initializes the global engine instance for the hooks.
 * This should be called once during application initialization (e.g., in lib/engine.ts).
 */
export function initHooks(engine: DocxesEngine) {
  globalEngine = engine;
}

function getEngine(): DocxesEngine {
  if (!globalEngine) {
    throw new Error(
      "DocxesEngine not initialized. Call initHooks(engine) before using hooks."
    );
  }
  return globalEngine;
}

/**
 * Returns a hierarchical "map" (array of NavItem) of the sidebar.
 * It checks the cache for each document to get the correct title and sort order without re-parsing files.
 */
export async function getNavigation(version: string): Promise<NavItem[]> {
  return getEngine().getNavigation(version);
}

/**
 * The primary "hook" for content.
 * It returns the pre-compiled MDX source, frontmatter, and the generated TOC array.
 * This method is optimized to use the .docxes cache.
 */
export async function getDoc(version: string, slug: string[]): Promise<DocFile | null> {
  return getEngine().getDoc(version, slug);
}

/**
 * Returns a flat array of all documents, using the pre-cached plainText version of each file for rapid indexing.
 */
export async function getSearchIndex(
  includeFields?: Array<"title" | "description" | "keywords" | "content">
): Promise<SearchResult[]> {
  return getEngine().getSearchIndex(includeFields);
}

export async function getVersions() {
  return getEngine().getVersions();
}

/**
 * Returns all versions metadata (Record<version, metadata>).
 */
export async function getVersionsMetadata() {
  return getEngine().getVersionsMetadata();
}

/**
 * Returns version metadata (title, description) from main.mdx at the root of the version folder.
 */
export async function getVersionMetadata(version: string) {
  return getEngine().getVersionMetadata(version);
}

export async function validateVersion(version: string) {
  const versions = await getVersions();
  return versions.includes(version);
}

export async function resolveDoc(version: string, slug: string[]) {
  const targetSlug = slug.length === 0 ? ["main"] : slug;
  return getEngine().getDoc(version, targetSlug);
}

export function getPagination(navigation: NavItem[], currentPath: string) {
  const flat: { href: string; title: string }[] = [];

  function collect(items: NavItem[]) {
    for (const item of items) {
      if (item.href) {
        flat.push({ href: item.href, title: item.title });
      }
      if (item.items) {
        collect(item.items);
      }
    }
  }

  collect(navigation);
  const index = flat.findIndex((item) => item.href === currentPath);

  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index < flat.length - 1 ? flat[index + 1] : null,
  };
}

/**
 * Parses a documentation path into version and slug.
 * Example: "/docs/v1/getting-started" -> { version: "v1", slug: ["getting-started"] }
 */
export function parseDocsPath(path: string): { version: string; slug: string[] } {
  const parts = path.split("/").filter(Boolean);
  
  // Handle cases where path starts with /docs/
  if (parts[0] === "docs") {
    return {
      version: parts[1] || "latest",
      slug: parts.slice(2),
    };
  }

  // Fallback: assume first part is version
  return {
    version: parts[0] || "latest",
    slug: parts.slice(1),
  };
}

export const getDocData = cache(async (pathOrVersion: string, slug?: string[]) => {
  let version = pathOrVersion;
  let targetSlug = slug || [];

  // If first argument looks like a path (contains /), parse it
  if (pathOrVersion.includes("/")) {
    const parsed = parseDocsPath(pathOrVersion);
    version = parsed.version;
    targetSlug = parsed.slug;
  }

  const isValid = await validateVersion(version);
  if (!isValid) return null;

  const [navigation, allVersions, doc] = await Promise.all([
    getNavigation(version),
    getVersions(),
    resolveDoc(version, targetSlug),
  ]);

  const currentPath = `/docs/${version}${targetSlug.length ? `/${targetSlug.join("/")}` : ""}`;
  const { prev, next } = getPagination(navigation, currentPath);

  return {
    doc,
    currentPath,
    prev,
    next,
    navigation,
    allVersions,
    version,
    slug: targetSlug,
  };
});

export interface PageProps {
  params: Promise<{
    version: string;
    slug?: string[];
  }>;
}

interface DocMetadataParams {
  title: string;
  description?: string;
  slug: string[];
  version: string;
}

/**
 * Simplified metadata fetcher for Docxes pages.
 * Accepts either a full URL/path or version/slug.
 */
export async function getDocMetadata(
  urlOrVersion: string,
  slugOrConfig?: string[] | { siteName: string; siteUrl: string },
  config?: { siteName: string; siteUrl: string }
) {
  let version = urlOrVersion;
  let slug: string[] = [];
  let finalConfig = config;

  if (typeof urlOrVersion === "string" && urlOrVersion.includes("/")) {
    const parsed = parseDocsPath(urlOrVersion);
    version = parsed.version;
    slug = parsed.slug;
    finalConfig = slugOrConfig as { siteName: string; siteUrl: string };
  } else {
    slug = (slugOrConfig as string[]) || [];
  }

  const data = await getDocData(version, slug);
  if (!data || !data.doc) {
    return {
      title: "Documentation",
      description: "Browse our comprehensive documentation",
    };
  }

  return generateDocMetadata({
    title: data.doc.title,
    description: data.doc.description,
    slug: data.slug,
    version: data.version,
    siteName: finalConfig?.siteName,
    siteUrl: finalConfig?.siteUrl,
  });
}

export function generateDocMetadata({
  title,
  description,
  slug,
  version,
  siteName = "DocXes",
  siteUrl = "http://localhost:3000",
}: DocMetadataParams & { siteName?: string; siteUrl?: string }): any {
  const fullTitle = `${title} | ${siteName}`;
  const metaDescription =
    description || `Documentation for ${title} in ${siteName}`;
  const canonicalUrl: string = `${siteUrl}/docs/${version}/${slug.join("/")}`;

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: [title, "documentation", siteName],
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      url: canonicalUrl,
      type: "article",
      siteName: siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: metaDescription,
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export function generateArticleSchema({
  title,
  description,
  slug,
  version,
  siteUrl = "http://localhost:3000",
}: DocMetadataParams & { siteUrl?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description || title,
    url: `${siteUrl}/docs/${version}/${slug.join("/")}`,
    author: {
      "@type": "Organization",
      name: "DocXes",
    },
  };
}

export function generateBreadcrumbSchema(
  version: string,
  slug: string[],
  siteUrl = "http://localhost:3000"
) {
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Docs",
      item: `${siteUrl}/docs`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: version,
      item: `${siteUrl}/docs/${version}`,
    },
  ];

  slug.forEach((part, index) => {
    items.push({
      "@type": "ListItem",
      position: 4 + index,
      name: part.charAt(0).toUpperCase() + part.slice(1),
      item: `${siteUrl}/docs/${version}/${slug.slice(0, index + 1).join("/")}`,
    });
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}