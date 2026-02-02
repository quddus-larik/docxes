import { AppMDXProvider } from "@/lib/mdx-provider";
import { PageProps } from "@/hooks/useContent";
import { useContentData } from "@/hooks/useContent";

export default async function DocsPage(props: PageProps) {
  const { version, slug = [] } = await props.params;
  const {
    doc,
    currentPath,
    prev,
    next,
    SidebarSlot,
    PaginationSlot,
    TOCSlot,
    articleSchema,
    breadcrumbSchema,
    styles,
    components,
  } = await useContentData(version, slug);

  const SidebarHeader = components.sidebarHeader;
  const SidebarFooter = components.sidebarFooter;
  const TOCHeader = components.TOCHeader;
  const TOCFooter = components.TOCFooter;

  return (
    <>
      {/* SEO Structured Data */}
      {articleSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="h-svh overflow-hidden">
        <div className="flex overflow-hidden h-full">
          <SidebarSlot 
            currentPath={currentPath} 
            version={version} 
            styles={styles.sidebar} 
            header={SidebarHeader ? <SidebarHeader version={version} /> : null}
            footer={SidebarFooter ? <SidebarFooter version={version} /> : null}
          />

          <div className="flex-1 overflow-auto lg:ml-0">
            <div className="mx-auto lg:w-full px-4 py-8 lg:px-8 lg:py-12 lg:pr-96">
              {doc ? (
                <>
                  <article className="prose prose-sm dark:prose-invert max-w-none" id="docs-scroll-container">
                    <h1 className="text-3xl font-bold mb-2">{doc.title}</h1>
                    {doc.description && (
                      <p className="text-muted-foreground text-lg mb-8">{doc.description}</p>
                    )}
                    <AppMDXProvider  source={doc.rawContent as string} />
                  </article>

                  {/* Pagination */}
                  <PaginationSlot
                    prevHref={prev?.href}
                    prevTitle={prev?.title}
                    nextHref={next?.href}
                    nextTitle={next?.title}
                    styles={styles.pagination}
                  />

                  <TOCSlot 
                    headings={doc.headings} 
                    styles={styles.TOC} 
                    header={TOCHeader ? <TOCHeader /> : null}
                    footer={TOCFooter ? <TOCFooter /> : null}
                  />
                </>
              ) : (
                <div className="py-12">
                  <h1 className="text-3xl font-bold mb-4">Documentation</h1>
                  <p className="text-muted-foreground mb-8">
                    Select a page from the sidebar to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
