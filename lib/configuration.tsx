import React from "react";
import { DocSidebar } from "@/components/doc-sidebar";
import { DocTOC } from "@/components/doc-toc";
import { DocPagination } from "@/components/doc-pagination";
import { ModeToggle } from "@/components/mode-toggle";
import { XMetaConfig } from "@/types/interface";

const DefaultContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-2">{children}</div>
);

const DefaultItem = ({ item, href, isActive }: any) => (
  <div className={`px-3 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
    {item.title}
  </div>
);

const DefaultGroup = ({ item, children, isOpen, onToggle }: any) => (
  <div className="flex flex-col">
    <button onClick={onToggle} className="text-left px-3 py-2 font-bold uppercase text-xs">
      {item.title}
    </button>
    {isOpen && <div className="pl-4 flex flex-col gap-1">{children}</div>}
  </div>
);

const DefaultTOCContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-2 p-4">{children}</div>
);

const DefaultTOCItem = ({ item }: any) => (
  <div className="text-sm text-muted-foreground hover:text-foreground">
    {item.text}
  </div>
);

const DefaultDocsViewer = ({ sidebar, content, toc, pagination }: any) => (
  <div className="flex flex-1">
    {sidebar}
    <main className="flex-1 lg:ml-0 min-w-0">
      <div className="flex items-start">
        <div className="flex-1 px-4 py-8 lg:px-8 lg:py-12 min-w-0">
          {content}
          {pagination}
        </div>
        {toc}
      </div>
    </main>
  </div>
);

const defaults: XMetaConfig = {
  framework: "nextjs",
  siteName: "DocXes",
  description: "A dynamic documentation engine build with typescript.",
  siteUrl: "https://docxes.vercel.app",
  contentDir: "content/docs",
  search: {
    enabled: true,
  },
  modeToggle: ModeToggle,
  theme: {
    mdx: {
      highlighter: "rehype-pretty-code",
      highlighterTheme: {
        light: "github-light",
        dark: "one-dark-pro",
      },
      keepBackground: false,
      showLineNumbers: true,
    },
    header: <div className="h-14 border-b flex items-center px-6 font-bold">DocXes</div>,
    docsViewer: DefaultDocsViewer,
    sidebar: {
      component: DocSidebar,
      Container: DefaultContainer,
      Item: DefaultItem,
      Group: DefaultGroup,
    },
    toc: {
      component: DocTOC,
      Container: DefaultTOCContainer,
      Item: DefaultTOCItem,
    },
    pagination: {
      component: DocPagination,
    }
  },
};

export const createConfig = (overrides: Partial<XMetaConfig> = {}): XMetaConfig => {
  return {
    ...defaults,
    ...overrides,
    search: { ...defaults.search, ...overrides.search },
    theme: { 
      ...defaults.theme, 
      ...overrides.theme,
      mdx: { ...defaults.theme.mdx, ...overrides.theme?.mdx },
      sidebar: { ...defaults.theme.sidebar, ...overrides.theme?.sidebar },
      toc: { ...defaults.theme.toc, ...overrides.theme?.toc },
    },
  };
};
