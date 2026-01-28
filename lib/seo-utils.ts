import type { Metadata } from "next";
import { XMeta } from "@/x-meta.config";

interface DocMetadataParams {
  title: string;
  description?: string;
  slug: string[];
  version: string;
}

export function generateDocMetadata({
  title,
  description,
  slug,
  version,
}: DocMetadataParams): Metadata {
  const fullTitle = `${title} | ${XMeta.siteName}`;
  const metaDescription =
    description || `Documentation for ${title} in ${XMeta.siteName}`;
  const canonicalUrl: string = `${XMeta.siteUrl}/docs/${version}/${slug.join("/")}`;

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: [title, "documentation", XMeta.siteName],
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      url: canonicalUrl,
      type: "article",
      siteName: XMeta.siteName,
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

export interface ArticleSchema {
  "@context": string;
  "@type": string;
  headline: string;
  description: string;
  url: string;
  author: {
    "@type": string;
    name: string;
  };
}

export function generateArticleSchema({
  title,
  description,
  slug,
  version,
}: DocMetadataParams): ArticleSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description || title,
    url: `${XMeta.siteUrl}/docs/${version}/${slug.join("/")}`,
    author: {
      "@type": "Organization",
      name: "DocX",
    },
  };
}

export interface BreadcrumbSchema {
  "@context": string;
  "@type": string;
  itemListElement: Array<{
    "@type": string;
    position: number;
    name: string;
    item: string;
  }>;
}

export function generateBreadcrumbSchema(
  version: string,
  slug: string[],
): BreadcrumbSchema {
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: XMeta.siteUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Docs",
      item: `${XMeta.siteUrl}/docs`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: version,
      item: `${XMeta.siteUrl}/docs/${version}`,
    },
  ];

  slug.forEach((part, index) => {
    items.push({
      "@type": "ListItem",
      position: 4 + index,
      name: part.charAt(0).toUpperCase() + part.slice(1),
      item: `${XMeta.siteUrl}/docs/${version}/${slug.slice(0, index + 1).join("/")}`,
    });
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}
