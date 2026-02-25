import { AppMDXProvider } from "@/lib/mdx-provider";
import { PageProps } from "@/hooks/useContent";
import { useContentData } from "@/hooks/useContent";
import { XMeta } from "@/x-meta.config";

export default async function DocsPage({ params }: PageProps) {
  const { version, slug = [] } = await params;
  const data = await useContentData(version, slug);
  
  const {
    doc: meta,
    currentPath,
    prev,
    next,
    navigation,
    allVersions,
    SidebarSlot,
    PaginationSlot,
    TOCSlot,
    articleSchema,
    breadcrumbSchema,
  } = data;

  const { docsViewer: DocsViewer } = XMeta.theme;

  return (
    <>
      {/* SEO Structured Data */}
      {articleSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <DocsViewer
        version={version}
        slug={slug}
        meta={meta}
        sidebar={
          <SidebarSlot 
            currentPath={currentPath} 
            version={version} 
            items={navigation}
            versions={allVersions}
          />
        }
        toc={
          meta && (
            <TOCSlot headings={meta.headings} />
          )
        }
        content={
          meta ? (
            <article className="prose prose-sm dark:prose-invert max-w-none">
              <h1 className="text-3xl font-bold mb-2">{meta.title}</h1>
              {meta.description && (
                <div className="text-muted-foreground text-lg mb-8">{meta.description}</div>
              )}
              <AppMDXProvider compiled={meta.content} />
            </article>
          ) : (
            <div className="py-12">
              <h1 className="text-3xl font-bold mb-4">Documentation</h1>
              <p className="text-muted-foreground mb-8">
                Select a page from the sidebar to get started.
              </p>
            </div>
          )
        }
        pagination={
          meta && (
            <PaginationSlot
              prev={prev}
              next={next}
            />
          )
        }
      />
    </>
  );
}
