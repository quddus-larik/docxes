import type { DocSidebarStyles } from "@/components/doc-sidebar";

export interface XMetaInterface {
  siteName: string,
  description: string,
  siteUrl: string,
  documentsPath: string,
  searchProvider: string,
  interface: DocXInterface,
  theme: DocXThemeInterface
}

export interface InterfaceComponents {
  sidebar?: React.ComponentType<any>;
  sidebarHeader?: React.ComponentType<any>;
  sidebarFooter?: React.ComponentType<any>;
  pagination?: React.ComponentType<any>;
  TOC?: React.ComponentType<any>;
  TOCHeader?: React.ComponentType<any>;
  TOCFooter?: React.ComponentType<any>;
  button?: React.ComponentType<any>;
}

export interface InterfaceStyles {
  sidebar?: DocSidebarStyles;
  TOC?: DocTOCStyles;
  pagination?: DocPaginationStyles;
}

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

export interface DocXInterface {
  components?: InterfaceComponents;
  styles?: InterfaceStyles;
}

interface DocXThemeInterface {
  mdx: {
    highlighter: string,
    theme: string,
    keepBackground: boolean
  },
  cssVars?: {
    light?: Record<string, string>;
    dark?: Record<string, string>;
    root?: Record<string, string>; // For non-color vars like radius
  }
}
