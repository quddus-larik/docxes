import type { DocSidebarStyles } from "@/components/doc-sidebar";
import type { DocNavItem, DocHeading, DocPaginationStyles, DocTOCStyles } from "@/core/engine";

export type { DocSidebarStyles, DocNavItem, DocHeading, DocPaginationStyles, DocTOCStyles };

export interface SidebarProps {
  items: DocNavItem[];
  versions: string[];
  version: string;
  currentPath: string;
  styles?: DocSidebarStyles;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  item?: React.ComponentType<{ item: DocNavItem; isActive: boolean; depth: number; onClick: () => void }>;
}

export interface TOCProps {
  headings: DocHeading[];
  styles?: DocTOCStyles;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  item?: React.ComponentType<{ heading: DocHeading; isActive: boolean; depth: number; onClick: () => void }>;
}

export interface PaginationProps {
  prev?: { href: string; title: string } | null;
  next?: { href: string; title: string } | null;
  styles?: DocPaginationStyles;
}

export interface HeaderProps {
  siteName: string;
  className?: string;
  versions: string[];
}

export interface FooterProps {
  siteName: string;
  version: string;
}

export interface XMetaConfig {
  siteName: string;
  description: string;
  siteUrl: string;
  documentsPath: string;
  search?: {
    enabled?: boolean;
  };
  theme: {
    mdx?: {
      highlighter?: string;
      theme?: string | { light?: string, dark?: string };
      themes?: { light?: string, dark?: string };
      keepBackground?: boolean;
      remarkPlugins?: any[];
      rehypePlugins?: any[];
    };
    cssVars?: {
      light?: Record<string, string>;
      dark?: Record<string, string>;
      root?: Record<string, string>;
    };
  };
  sidebar: {
    component?: React.ComponentType<SidebarProps>;
    item?: React.ComponentType<{ item: DocNavItem; isActive: boolean; depth: number; onClick: () => void }>;
    header?: React.ComponentType<{ version: string; versions: string[] }>;
    footer?: React.ComponentType<{ version: string }>;
    styles?: DocSidebarStyles;
  };
  toc: {
    component?: React.ComponentType<TOCProps>;
    item?: React.ComponentType<{ heading: DocHeading; isActive: boolean; depth: number; onClick: () => void }>;
    header?: React.ComponentType<any>;
    footer?: React.ComponentType<any>;
    styles?: DocTOCStyles;
  };
  pagination: {
    component?: React.ComponentType<PaginationProps>;
    styles?: DocPaginationStyles;
  };
  versions: {
    default: string;
  };
  sitemap?: {
    enabled?: boolean;
    siteUrl?: string;
  };
  header?: React.ComponentType<HeaderProps>;
  footer?: React.ComponentType<FooterProps>;
  button?: React.ComponentType<any>;
  modeToggle?: React.ComponentType<any>;
}

export interface XMetaInterface extends XMetaConfig {}
