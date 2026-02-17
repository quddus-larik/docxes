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