"use client";

import React from "react";
import { useXMeta } from "../context";
import { DocxesRenderer } from "./renderer";
import { DocFile, NavItem } from "./types";

export interface DocsViewerClientProps {
  data: {
    doc: DocFile | null;
    currentPath: string;
    prev: { href: string; title: string } | null;
    next: { href: string; title: string } | null;
    navigation: NavItem[];
    allVersions: string[];
    version: string;
    slug: string[];
  };
}

export function DocsViewerClient({ data }: DocsViewerClientProps) {
  const config = useXMeta();
  if (!config) return null;

  const { doc, navigation, allVersions, prev, next, currentPath, version, slug } = data;
  const { docsViewer: Layout, sidebar, toc, pagination, mdx } = config.theme;

  // These components are expected to be available in the config
  const SidebarSlot = sidebar.component;
  const TOCSlot = toc.component;
  const PaginationSlot = pagination?.component;

  const sidebarElement = SidebarSlot ? (
    <SidebarSlot 
      currentPath={currentPath} 
      version={version} 
      items={navigation}
      versions={allVersions}
    />
  ) : null;

  const tocElement = (doc && TOCSlot) ? (
    <TOCSlot headings={doc.headings} />
  ) : null;

  const paginationElement = (doc && PaginationSlot) ? (
    <PaginationSlot prev={prev} next={next} />
  ) : null;

  const contentElement = doc ? (
    <article className="prose prose-sm dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-2">{doc.title}</h1>
      {doc.description && (
        <div className="text-muted-foreground text-lg mb-8">{doc.description}</div>
      )}
      <DocxesRenderer code={doc.content} components={mdx.components} />
    </article>
  ) : (
    <div className="py-12">
      <h1 className="text-3xl font-bold mb-4">Documentation</h1>
      <p className="text-muted-foreground mb-8">
        Select a page from the sidebar to get started.
      </p>
    </div>
  );

  return (
    <Layout
      version={version}
      slug={slug}
      meta={doc}
      sidebar={sidebarElement}
      toc={tocElement}
      content={contentElement}
      pagination={paginationElement}
    />
  );
}
