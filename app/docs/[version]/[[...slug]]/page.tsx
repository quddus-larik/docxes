import { AppMDXProvider } from "@/lib/mdx-provider";
import { PageProps } from "@/hooks/useContent";
import { useContentData } from "@/hooks/useContent";

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
    styles,
    components,
  } = data;

  const {
    sidebarHeader: SidebarHeader,
    sidebarFooter: SidebarFooter,
    sidebarItem: SidebarItem,
    TOCHeader,
    TOCFooter,
    tocItem: TOCItem,
  } = components || {};

  return (
    <>
      {/* SEO Structured Data */}
      {articleSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="flex flex-1">
        <SidebarSlot 
          currentPath={currentPath} 
          version={version} 
          items={navigation}
          versions={allVersions}
          item={SidebarItem}
          styles={styles?.sidebar} 
          header={SidebarHeader ? <SidebarHeader version={version} /> : null}
          footer={SidebarFooter ? <SidebarFooter version={version} /> : null}
        />

        <div className="relative flex-1 lg:ml-0">
          <div className="mx-auto lg:w-full px-4 py-8 lg:px-8 lg:py-12 lg:pr-80">
            {meta ? (
              <>
                <article className="prose prose-sm dark:prose-invert max-w-none">
                  <h1 className="text-3xl font-bold mb-2">{meta.title}</h1>
                  {meta.description && (
                    <p className="text-muted-foreground text-lg mb-8">{meta.description}</p>
                  )}
                  <AppMDXProvider source={meta.rawContent as string} />
                </article>

                {/* Pagination */}
                <PaginationSlot
                  prev={prev}
                  next={next}
                  styles={styles?.pagination}
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

          {/* Table of Contents - Positioned outside main container */}
          {meta && (
            <div className="absolute top-8 right-8 hidden xl:block w-64">
              <TOCSlot 
                headings={meta.headings} 
                item={TOCItem}
                styles={styles?.TOC} 
                header={TOCHeader ? <TOCHeader /> : null}
                footer={TOCFooter ? <TOCFooter /> : null}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
