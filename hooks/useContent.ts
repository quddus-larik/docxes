import { generateNavigation, getVersions } from "@/lib/docs";
import { getPlugin } from "@/lib/plugin-registry";
import { validateVersion, resolveDoc, getCurrentPath, getPagination } from "@/lib/doc-preview";
import { generateDocMetadata, generateArticleSchema, generateBreadcrumbSchema } from "@/lib/seo-utils";
import type { Metadata } from "next";
import { XMeta } from "@/x-meta.config";

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
    generateNavigation(version),
    getVersions(),
  ]);

  const doc = await resolveDoc(version, slug);
  const currentPath = getCurrentPath(version, slug);
  const { prev, next } = getPagination(navigation, currentPath);

  // Get Styles and Slots from XMeta directly
  const styles = {
    sidebar: XMeta.sidebar?.styles || {},
    TOC: XMeta.toc?.styles || {},
    pagination: XMeta.pagination?.styles || {},
  };
  
  const components = {
    sidebar: XMeta.sidebar?.component || getPlugin("sidebar"),
    sidebarHeader: XMeta.sidebar?.header,
    sidebarFooter: XMeta.sidebar?.footer,
    sidebarItem: XMeta.sidebar?.item,
    TOC: XMeta.toc?.component || getPlugin("TOC"),
    TOCHeader: XMeta.toc?.header,
    TOCFooter: XMeta.toc?.footer,
    tocItem: XMeta.toc?.item,
    pagination: XMeta.pagination?.component || getPlugin("pagination"),
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
    SidebarSlot: components.sidebar,
    PaginationSlot: components.pagination,
    TOCSlot: components.TOC,
    articleSchema,
    breadcrumbSchema,
    styles,
    components,
  };
}
