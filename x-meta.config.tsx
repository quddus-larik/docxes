import { DocPagination } from "./components/doc-pagination";
import { DocSidebar } from "./components/doc-sidebar";
import { DocTOC } from "./components/doc-toc";
import { Header } from "./components/header";
import { ModeToggle } from "./components/mode-toggle";
import { Badge } from "./components/ui/badge";
import { GButton } from "./plugins/deftheme/GButton";
import { XMetaConfig } from "./types/interface";
import { CurvedUI } from "./marketplace/curved-ui";

/**
 * Default configuration for DocX.
 */
const defaults: XMetaConfig = {
  siteName: "DocX",
  description: "A dynamic documentation generator framework built with Next.js",
  siteUrl: "http://localhost:3000",
  documentsPath: "content/docs",
  searchProvider: "local",
  theme: {
    mdx: {
      highlighter: "pretty-code",
      theme: "github-dark",
      keepBackground: false,
    },
  },
  header: Header,
  modeToggle: ModeToggle,
  sidebar: {
    component: DocSidebar,
    styles: {},
  },
  toc: {
    component: DocTOC,
    styles: {},
  },
  pagination: {
    component: DocPagination,
    styles: {},
  },
  versions: {
    default: "v1",
  }
};

/**
 * DocX Configuration Factory
 */
export const xMetaConfig = (overrides: Partial<XMetaConfig> = {}): XMetaConfig => {
  return {
    ...defaults,
    ...overrides,
    theme: {
      ...defaults.theme,
      ...overrides.theme,
      mdx: {
        ...defaults.theme.mdx,
        ...overrides.theme?.mdx,
      },
      cssVars: {
        ...defaults.theme.cssVars,
        ...overrides.theme?.cssVars,
      },
    },
    sidebar: {
      ...defaults.sidebar,
      ...overrides.sidebar,
      styles: {
        ...defaults.sidebar.styles,
        ...overrides.sidebar?.styles,
      },
    },
    toc: {
      ...defaults.toc,
      ...overrides.toc,
      styles: {
        ...defaults.toc.styles,
        ...overrides.toc?.styles,
      },
    },
    pagination: {
      ...defaults.pagination,
      ...overrides.pagination,
      styles: {
        ...defaults.pagination.styles,
        ...overrides.pagination?.styles,
      },
    },
    versions: {
      ...defaults.versions,
      ...overrides.versions,
    },
    modeToggle: overrides.modeToggle || defaults.modeToggle,
  };
};

export default xMetaConfig;

/**
 * Resolved configuration instance
 * To switch to Curved UI, simply merge it here: xMetaConfig(CurvedUI)
 */
export const XMeta = xMetaConfig({
  ...CurvedUI,
  siteName: "DocX - lixril",
  description: "Comprehensive documentation for DocX",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://docxes.vercel.app",
  
  // You can still override CurvedUI settings here if needed
  sidebar: {
    ...CurvedUI.sidebar,
    header: ({ version }: { version: string }) => (
      <div className="px-6 py-4 border-b">
        <div className="font-bold text-lg">Docxes</div>
        <Badge>{version}</Badge>
      </div>
    ),
  },

  button: GButton,
});
