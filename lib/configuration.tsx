
import { DocPagination } from "@/components/doc-pagination";
import { DocSidebar } from "@/components/doc-sidebar";
import { DocTOC } from "@/components/doc-toc";
import { Header } from "@/components/header";
import { ModeToggle } from "@/components/mode-toggle";
import { XMetaConfig } from "@/types/interface";

import { VersionSelect } from "@/components/version-select";

const defaults: XMetaConfig = {
  siteName: "DocXes",
  description: "A dynamic documentation generator framework",
  siteUrl: "http://localhost:3000",
  documentsPath: "content/docs",
  search: {
    enabled: true,
  },
  theme: {
    mdx: {
      highlighter: "shiki",
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      keepBackground: false,
    },
  },
  header: () => <p>Header</p>,
  modeToggle: ModeToggle,
  sidebar: { 
    component: DocSidebar, 
    styles: {},
    header: ({ version, versions }: { version: string; versions?: string[] }) => {
      return (
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-sm tracking-tight">Documentation</span>
          </div>
          {versions && versions.length > 1 && (
            <VersionSelect versions={versions} currentVersion={version} />
          )}
        </div>
      )
    }
  },
  toc: { component: DocTOC, styles: {} },
  pagination: { component: DocPagination, styles: {} },
  versions: { default: "v1" }
};


export const createConfig = (overrides: Partial<XMetaConfig> = {}): XMetaConfig => {
  return {
    ...defaults,
    ...overrides,
    search: { ...defaults.search, ...overrides.search },
    theme: { ...defaults.theme, ...overrides.theme },
    sidebar: { ...defaults.sidebar, ...overrides.sidebar },
    toc: { ...defaults.toc, ...overrides.toc },
    pagination: { ...defaults.pagination, ...overrides.pagination },
    versions: { ...defaults.versions, ...overrides.versions },
  };
};