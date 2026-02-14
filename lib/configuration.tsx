
import { DocPagination } from "@/components/doc-pagination";
import { DocSidebar } from "@/components/doc-sidebar";
import { DocTOC } from "@/components/doc-toc";
import { Header } from "@/components/header";
import { ModeToggle } from "@/components/mode-toggle";
import { XMetaConfig } from "@/types/interface";

const defaults: XMetaConfig = {
  siteName: "DocXes",
  description: "A dynamic documentation generator framework",
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
  sidebar: { component: DocSidebar, styles: {} },
  toc: { component: DocTOC, styles: {} },
  pagination: { component: DocPagination, styles: {} },
  versions: { default: "v1" }
};


export const createConfig = (overrides: Partial<XMetaConfig> = {}): XMetaConfig => {
  return {
    ...defaults,
    ...overrides,
    theme: { ...defaults.theme, ...overrides.theme },
    sidebar: { ...defaults.sidebar, ...overrides.sidebar },
    toc: { ...defaults.toc, ...overrides.toc },
    pagination: { ...defaults.pagination, ...overrides.pagination },
    versions: { ...defaults.versions, ...overrides.versions },
  };
};

/* -------------------------------------------------------------------------- */
/*                            ACTIVE CONFIGURATION                            */
/* -------------------------------------------------------------------------- */
