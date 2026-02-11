import type { DocSidebarStyles } from "@/components/doc-sidebar";
import type { DocNavItem, DocHeading } from "@/types/types";

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

export interface XMetaConfig {
  siteName: string;
  description: string;
  siteUrl: string;
  documentsPath: string;
  searchProvider: string;
  theme: {
    mdx?: {
      highlighter?: string;
      theme?: string;
      keepBackground?: boolean;
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
    header?: React.ComponentType<{ version: string }>;
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
  header?: React.ComponentType<any>;
  footer?: React.ComponentType<any>;
  button?: React.ComponentType<any>;
}

export interface XMetaInterface extends XMetaConfig {}

export interface DocTOCStyles {
  container?: string;
  nav?: string;
  title?: string;
  item?: string;
  itemActive?: string;
}

export interface DocPaginationStyles {
  container?: string;
  button?: string;
  prevLabel?: string;
  nextLabel?: string;
  title?: string;
}
