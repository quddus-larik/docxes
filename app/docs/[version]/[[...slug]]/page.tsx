import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDoc, generateNavigation, getVersions } from "@/lib/docs";
import { DocSidebar } from "@/components/doc-sidebar";
import { AppMDXProvider } from "@/lib/mdx-provider";
import { getPlugin } from "@/lib/plugin-registry";
interface PageProps {
  params: Promise<{
    version: string;
    slug?: string[];
  }>;
}

export async function generateStaticParams() {
  const versions = getVersions();
  const params = [];

  for (const version of versions) {
    params.push({ version, slug: undefined });

    // Generate params for nested routes
    // In a real app, you might want to load all docs here
  }

  return params;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug || [];

  if (!slug.length) {
    return {
      title: `Documentation - ${params.version}`,
      description: "Documentation",
    };
  }

  const doc = await getDoc(params.version, slug);

  if (!doc) {
    return {
      title: "Not Found",
      description: "Documentation page not found",
    };
  }

  return {
    title: `${doc.title} - Docs`,
    description: doc.description || "Documentation",
  };
}

export default async function DocsPage(props: PageProps) {
  const params = await props.params;
  const { version, slug = [] } = params;
  const versions = getVersions();

  const PaginationSlot = getPlugin("pagination");
  const TOCSlot = getPlugin("TOC");

  // Validate version
  if (!versions.includes(version)) {
    notFound();
  }

  // Sidebar will fetch its own via API for dynamic updates
  const navigation = await generateNavigation(version);

  // Get document if slug provided
  let doc = null;
  if (slug.length > 0) {
    doc = await getDoc(version, slug);
    if (!doc) {
      notFound();
    }
  }

  // Current path for sidebar active state
  const currentPath = `/docs/${version}${slug.length > 0 ? "/" + slug.join("/") : ""}`;

  // Helper to find prev/next in nav
  function getPagination() {
    const allItems: Array<{ href: string; title: string }> = [];

    function collect(items: any[]) {
      items.forEach((item) => {
        if (item.href) {
          allItems.push({ href: item.href, title: item.title });
        }
        if (item.items) {
          collect(item.items);
        }
      });
    }

    collect(navigation);

    const currentIndex = allItems.findIndex(
      (item) => item.href === currentPath,
    );
    const prev = currentIndex > 0 ? allItems[currentIndex - 1] : null;
    const next =
      currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

    return { prev, next };
  }

  const { prev, next } = getPagination();

  return (
    <div className="h-svh">
      <div className="w-full h-16 border-b-[1.5px]"></div>
      <div className="flex overflow-hidden h-full">
        <DocSidebar currentPath={currentPath} version={version} />

        <div className="flex-1 overflow-auto lg:ml-0">
          <div className="mx-auto lg:w-full px-4 py-8 lg:px-8 lg:py-12 lg:pr-96">
            {doc ? (
              <>
                <article className="prose prose-sm dark:prose-invert max-w-none">
                  <h1 className="text-3xl font-bold mb-2">{doc.title}</h1>
                  {doc.description && (
                    <p className="text-muted-foreground text-lg mb-8">
                      {doc.description}
                    </p>
                  )}
                  {doc && <AppMDXProvider source={doc.rawContent} />}
                </article>

                {/* Pagination */}
                <PaginationSlot
                  prevHref={prev?.href}
                  prevTitle={prev?.title}
                  nextHref={next?.href}
                  nextTitle={next?.title}
                />

                <TOCSlot headings={doc.headings} />
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
  );
}
