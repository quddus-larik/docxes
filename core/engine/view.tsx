import React from "react";
import { getDocData, generateArticleSchema, generateBreadcrumbSchema } from "../hooks";
import { DocsViewerClient } from "./view-client";
import { notFound } from "next/navigation";

export interface DocsViewerPageProps {
  url?: string;
  version?: string;
  slug?: string[];
  config: { siteUrl: string };
}

/**
 * Server-side wrapper for the documentation viewer.
 * It handles data fetching and SEO schema generation.
 */
export async function DocsViewer({ url, version, slug, config }: DocsViewerPageProps) {
  // Use URL if provided, otherwise fallback to version/slug
  const data = url 
    ? await getDocData(url)
    : await getDocData(version!, slug || []);
  
  if (!data) {
    notFound();
  }

  const { version: dataVersion, slug: dataSlug } = data;

  const articleSchema = data.doc ? generateArticleSchema({
    title: data.doc.title,
    description: data.doc.description,
    slug: dataSlug,
    version: dataVersion,
    siteUrl: config.siteUrl,
  }) : null;

  const breadcrumbSchema = generateBreadcrumbSchema(dataVersion, dataSlug, config.siteUrl);

  return (
    <>
      {articleSchema && (
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} 
        />
      )}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} 
      />
      <DocsViewerClient data={data} />
    </>
  );
}
