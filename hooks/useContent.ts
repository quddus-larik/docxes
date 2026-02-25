import { getPlugin } from "@/lib/plugin-registry";
import { validateVersion, resolveDoc, getCurrentPath, getPagination } from "@/lib/doc-preview";
import { generateDocMetadata, generateArticleSchema, generateBreadcrumbSchema } from "@/lib/seo-utils";
import { getNavigation } from "@/core/hooks";
import type { Metadata } from "next";
import { XMeta } from "@/x-meta.config";
import { engine } from "@/lib/engine";

export interface PageProps {
  params: Promise<{
    version: string;
    slug?: string[];
  }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { version, slug = [] } = await props.params;

  if (slug.length === 0) {
    return {
      title: "Documentation",
      description: "Browse our comprehensive documentation",
    };
  }

  try {
    const doc = await resolveDoc(version, slug);
    if (doc) {
      return generateDocMetadata({
        title: doc.title,
        description: doc.description,
        slug,
        version,
      });
    }
  } catch {
    // fallback metadata
  }

  return {
    title: "Documentation",
    description: "Documentation page",
  };
}

export async function useContentData(version: string, slug: string[] = []) {
  await validateVersion(version);

  const [navigation, allVersions] = await Promise.all([
    getNavigation(version),
    engine.getVersions(),
  ]);

  const doc = await resolveDoc(version, slug);
  const currentPath = getCurrentPath(version, slug);
  const { prev, next } = getPagination(navigation, currentPath);

  // Get Styles and Slots from XMeta directly
  const styles = {
    sidebar: XMeta.theme.sidebar?.styles || {},
    TOC: XMeta.theme.toc?.styles || {},
    pagination: XMeta.theme.pagination?.styles || {},
  };
  
  const components = {
    sidebar: XMeta.theme.sidebar?.component,
    TOC: XMeta.theme.toc?.component,
    pagination: XMeta.theme.pagination?.component,
  };

  const articleSchema = doc ? generateArticleSchema({
    title: doc.title,
    description: doc.description,
    slug,
    version,
  }) : null;

  const breadcrumbSchema = generateBreadcrumbSchema(version, slug);

  return {
    doc,
    currentPath,
    prev,
    next,
    navigation,
    allVersions,
    SidebarSlot: components.sidebar || (() => null),
    PaginationSlot: components.pagination || (() => null),
    TOCSlot: components.TOC || (() => null),
    articleSchema,
    breadcrumbSchema,
    styles,
    components,
  };
}
