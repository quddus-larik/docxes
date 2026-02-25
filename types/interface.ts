import type { DocNavItem, DocHeading, DocPaginationStyles, DocTOCStyles } from "@/core/engine";
import React from "react";

export type { DocNavItem, DocHeading, DocPaginationStyles, DocTOCStyles };

export type FrameWorkType = "nextjs" | "react-router" | "remix" | "astro-react";

export interface SidebarContainerProps {
  children: React.ReactNode;
  version: string;
  versions: string[];
  items: DocNavItem[];
}

export interface SidebarItemProps {
  item: DocNavItem;
  href?: string;
  isActive: boolean;
  depth: number;
}

export interface SidebarGroupProps {
  item: DocNavItem;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  depth: number;
}

export interface TOCContainerProps {
  children: React.ReactNode;
  headings: DocHeading[];
}

export interface TOCItemProps {
  item: DocHeading;
  index: number;
  isActive: boolean;
}

export interface HeaderProps {
  siteName: string;
  className?: string;
  versions?: string[];
}

export interface DocsViewerProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
  toc: React.ReactNode;
  pagination: React.ReactNode;
  version: string;
  slug: string[];
  meta: any;
}

export interface XMetaConfig {
  framework: FrameWorkType;
  siteName: string;
  description: string;
  siteUrl: string;
  contentDir: string;
  versions?: {
    default: string;
    allowVersions?: boolean;
  };
  search: {
    enabled: boolean;
    provider?: string;
  };
  sitemap?: {
    enabled: boolean 
  };
  modeToggle?: React.ComponentType<any>;
  theme: {
    mdx: {
      components?: Record<string, any>;
      highlighter: "rehype-pretty-code" | "shiki";
      highlighterTheme: {
        dark: string;
        light: string;
      };
      keepBackground: boolean;
      showLineNumbers: boolean;
    };
    header?: React.ReactNode | React.ComponentType<any>;
    footer?: React.ReactNode | React.ComponentType<any>;
    docsViewer: React.ComponentType<DocsViewerProps>;
    sidebar: {
      component?: React.ComponentType<any>;
      styles?: any;
      Container: React.ComponentType<SidebarContainerProps>;
      Item: React.ComponentType<SidebarItemProps>;
      Group: React.ComponentType<SidebarGroupProps>;
    };
    toc: {
      component?: React.ComponentType<any>;
      styles?: any;
      Container: React.ComponentType<TOCContainerProps>;
      Item: React.ComponentType<TOCItemProps>;
    };
    pagination?: {
      component?: React.ComponentType<any>;
      styles?: DocPaginationStyles;
    };
  };
}

export interface XMetaInterface extends XMetaConfig {}
