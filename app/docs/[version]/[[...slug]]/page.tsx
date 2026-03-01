import type { PageProps } from "@/core/hooks";
import { DocsViewer } from "@/core/engine";
import { XMeta } from "@/x-meta.config";
import { getStaticParams } from "@/core/nextjs";

export const generateStaticParams = getStaticParams;

export default async function DocsPage({ params }: PageProps) {
  const { version, slug = [] } = await params;
  const url = `/docs/${version}/${slug.join("/")}`;
  
  return (
    <DocsViewer 
      url={url}
      config={XMeta} 
    />
  );
}