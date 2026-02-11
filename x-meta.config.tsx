import { DocPagination } from "./components/doc-pagination";
import { DocSidebar } from "./components/doc-sidebar";
import { DocTOC } from "./components/doc-toc";
import { Badge } from "./components/ui/badge";
import { GButton } from "./plugins/deftheme/GButton";
import { XMetaConfig } from "./types/interface";

/**
 * Default configuration for DocX.
 * These values are used if they are not provided in the config.
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
 * Refactored into a single function that accepts overrides and returns a plain JS object.
 */
const xMetaConfig = (overrides: Partial<XMetaConfig> = {}): XMetaConfig => {
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
    }
  };
};

/**
 * Export the configuration function as default.
 * This satisfies the requirement of exporting an arrow function.
 */
export default xMetaConfig;

/**
 * Resolved configuration instance for internal framework use.
 * This ensures no breaking changes for existing components that import XMeta.
 */
export const XMeta = xMetaConfig({
  siteName: "DocX - lixril",
  description: "Comprehensive documentation for DocX - A dynamic documentation generator framework built with Next.js",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://docxes.vercel.app",
  
  sidebar: {
    header: ({ version }: { version: string }) => (
      <div className="px-6 py-4 border-b">
        <div className="font-bold text-lg">Docxes</div>
        <Badge>{version}</Badge>
      </div>
    ),
    footer: () => (
      <div className="px-6 py-4 border-t text-xs text-muted-foreground">
        © 2026 Lixril. Built with Docxes.
      </div>
    ),
    styles: {
      
    },
    // Example: Custom Sidebar Item rendering But not work: directly passing server to client component 
    // item: ({ item, isActive, depth, onClick }) => (
    //   <a 
    //     href={item.href} 
    //     onClick={onClick}
    //     className={`block px-4 py-2 ${isActive ? 'bg-primary text-white' : 'hover:bg-muted'}`}
    //     style={{ paddingLeft: `${depth * 12 + 16}px` }}
    //   >
    //     {item.title}
    //   </a>
    // ),
  },

  toc: {
    styles: {
      title: "text-xs font-bold uppercase tracking-widest text-primary mb-4",
    },
    // Example: Custom TOC Item rendering But not work: directly passing server to client component 
    // item: ({ heading, isActive, onClick }) => (
    //   <button 
    //     onClick={onClick}
    //     className={`text-left text-sm ${isActive ? 'text-primary font-bold' : 'text-muted-foreground'}`}
    //   >
    //     {heading.text}
    //   </button>
    // ),
  },

  pagination: {
    // Example of a custom pagination UI using an arrow function
    component: ({ prev, next }) => (
      <div className="flex justify-between mt-10 border-t pt-5">
        {prev && <a href={prev.href}>← {prev.title}</a>}
        {next && <a href={next.href}>{next.title} →</a>}
      </div>
    ),
    styles: {
      container: "flex items-center justify-between gap-6 pt-10 mt-16 border-t",
    }
  },

  theme: {
    cssVars: {
      light: {
        "primary": "oklch(0.21 0.006 285.885)",
        "primary-foreground": "oklch(0.985 0 0)",
        "secondary": "oklch(0.70 0.19 338)"
      },
      dark: {
        "primary": "#A161E2",
        "primary-foreground": "#E8F0FD",
        "secondary": "#5A2E93"
      }
    }
  },
  
  button: GButton,
});
