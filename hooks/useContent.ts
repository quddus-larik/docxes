import { generateNavigation } from "@/lib/docs";
import { getPlugin } from "@/lib/plugin-registry";
import { validateVersion, resolveDoc, getCurrentPath, getPagination } from "@/lib/doc-preview";
import { generateDocMetadata, generateArticleSchema, generateBreadcrumbSchema } from "@/lib/seo-utils";
import type { Metadata } from "next";

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
  validateVersion(version);

  const navigation = await generateNavigation(version);
  const doc = await resolveDoc(version, slug);
  const currentPath = getCurrentPath(version, slug);
  const { prev, next } = getPagination(navigation, currentPath);

  const SidebarSlot = getPlugin("sidebar");
  const PaginationSlot = getPlugin("pagination");
  const TOCSlot = getPlugin("TOC");

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
    SidebarSlot,
    PaginationSlot,
    TOCSlot,
    articleSchema,
    breadcrumbSchema,
  };
}
