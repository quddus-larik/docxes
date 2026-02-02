import { DocPagination } from "./components/doc-pagination";
import { DocSidebar } from "./components/doc-sidebar";
import { DocTOC } from "./components/doc-toc";
import { GButton } from "./plugins/deftheme/GButton";
import { DocXInterface, XMetaInterface } from "./types/interface";
// Sitename

export const XMeta: XMetaInterface = {
  siteName: "DocX - lixril",
  description:
    "Comprehensive documentation for DocX - A dynamic documentation generator framework built with Next.js",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://docxes.vercel.app",
  documentsPath: "content/docs",
  theme: {
    mdx: {
      highlighter: "pretty-code",
      theme: "github-light",
      keepBackground: false,
    },
  },
  searchProvider: "<void>",
  interface: {
    components: {
      button: GButton, // test code
      pagination: DocPagination,
      TOC: DocTOC,
      sidebar: DocSidebar,
    },
    styles: {
      
    },
  },
};
