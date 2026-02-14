import Fuse from "fuse.js";
import { SearchProviderInterface, SearchResult, SearchOptions } from "../types";
import { SearchableDoc } from "@/types/types";

export class LocalSearchProvider implements SearchProviderInterface {
  name = "local";
  private fuse: Fuse<SearchableDoc> | null = null;
  private docs: SearchableDoc[] = [];

  async initialize(): Promise<void> {
    try {
      const response = await fetch("/api/docs?type=search");
      if (!response.ok) throw new Error("Failed to fetch search index");
      const data = await response.json();
      this.docs = data.docs;

      this.fuse = new Fuse(this.docs, {
        keys: [
          { name: "title", weight: 10 },
          { name: "description", weight: 5 },
          { name: "keywords", weight: 8 },
          { name: "content", weight: 1 },
        ],
        threshold: 0.3,
        minMatchCharLength: 2,
        ignoreLocation: true,
      });
    } catch (error) {
      console.error("Failed to initialize local search:", error);
    }
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    if (!this.fuse || !query.trim()) return [];

    let results = this.fuse.search(query).map((r) => r.item);

    if (options?.version && options.version !== "all") {
      results = results.filter((doc) => doc.version === options.version);
    }

    if (options?.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }
  
  getVersions(): string[] {
      return Array.from(new Set(this.docs.map(doc => doc.version)));
  }
}
