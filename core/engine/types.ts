export interface Frontmatter {
  title?: string;
  description?: string;
  tags?: string[];
  [key: string]: any;
}

export interface TOCItem {
  id: string;
  title: string;
  depth: number;
}

export type DocHeading = { level: number; text: string; id: string };

export interface DocxesMetadata {
  frontmatter: Frontmatter;
  toc: TOCItem[];
  readingTime?: number;
  ast: any;
  plainText?: string;
}

export interface DocxesOutput {
  compiled: any;
  metadata: DocxesMetadata;
}

export type HookHandler<T = any> = (data: T) => T | Promise<T>;

export interface PluginHooks {
  beforeParse?: HookHandler<string>;
  afterParse?: HookHandler<any>; // AST
  beforeCompile?: HookHandler<any>; // Transformed AST
  afterRender?: HookHandler<string>; // HTML/Code
}

export interface DocxesPlugin {
  name: string;
  hooks: PluginHooks;
}

export interface EngineConfig {
  plugins?: DocxesPlugin[];
  components?: Record<string, any>;
  theme?: string;
  documentsPath?: string;
  mdx?: {
    highlighter?: string;
    theme?: string;
    keepBackground?: boolean;
  };
}

export interface NavItem {
  title: string;
  href?: string;
  items?: NavItem[];
  order?: number;
}

export type DocNavItem = NavItem;

export interface DocFile {
  slug: string[];
  path: string;
  title: string;
  description?: string;
  order?: number;
  keywords?: string[];
  content: any; // Compiled MDX
  rawContent: string;
  plainText: string;
  headings: DocHeading[];
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  keywords?: string[];
  content: string;
  version: string;
  href: string;
}

export type SearchableDoc = SearchResult;

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
