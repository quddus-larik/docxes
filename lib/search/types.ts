export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  href: string;
  version?: string;
  keywords?: string[];
  content?: string; // Optional, for display or deeper matching
}

export interface SearchOptions {
  limit?: number;
  version?: string;
}

export interface SearchProviderInterface {
  name: string;
  initialize(): Promise<void>;
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
}
