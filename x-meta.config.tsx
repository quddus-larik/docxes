import { DocPagination } from "./components/doc-pagination";
import { DocSidebar } from "./components/doc-sidebar";
import { DocTOC } from "./components/doc-toc";
import { Badge } from "./components/ui/badge";
import { GButton } from "./plugins/deftheme/GButton";
import { XMetaInterface } from "./types/interface";
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
      theme: "github-dark",
      keepBackground: false,
    },
    cssVars: {
      light: {
        "primary": "oklch(0.21 0.006 285.885)",
        "primary-foreground": "oklch(0.985 0 0)"
      },
      dark: {
        "primary": "oklch(0.92 0.004 286.32)",
        "primary-foreground": "oklch(0.21 0.006 285.885)"
      }
    }
  },
  searchProvider: "local",
  interface: {
    components: {
      button: GButton,
      pagination: DocPagination,
      TOC: DocTOC,
      sidebar: DocSidebar,
      sidebarHeader: ({ version }: { version: string }) => (
        <div className="px-6 py-4 border-b">
          <div className="font-bold text-lg">Docxes</div>
          <Badge>{version}</Badge>
        </div>
      ),
      sidebarFooter: () => (
        <div className="px-6 py-4 border-t text-xs text-muted-foreground">
          © 2026 Lixril. Built with Docxes.
        </div>
      ),
    },
    styles: {
      sidebar: {
        sidebar: "bg-background border-r border-border flex flex-col",
        toggleBtn: "bg-green-400 rounded-r-full",
        itemActive: "bg-blue-400"
      },
      TOC: {
        title: "text-xs font-bold uppercase tracking-widest text-primary mb-4",
      },
      pagination: {
        container: "flex items-center justify-between gap-6 pt-10 mt-16 border-t",
      }
    },
  },
};
