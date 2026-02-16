import FlexSearch from "flexsearch";
import { SearchProviderInterface, SearchResult, SearchOptions } from "../types";
import { SearchableDoc } from "@/core/engine";

export class FlexSearchProvider implements SearchProviderInterface {
  name = "flexsearch";
  private index: any;
  private docs: Map<string, SearchableDoc> = new Map();

  async initialize(): Promise<void> {
    try {
      const response = await fetch("/api/docs?type=search");
      if (!response.ok) throw new Error("Failed to fetch search index");
      const data = await response.json();
      const docs: SearchableDoc[] = data.docs;

      // Initialize FlexSearch Document index
      this.index = new (FlexSearch as any).Document({
        document: {
          id: "id",
          index: [
            {
              field: "title",
              tokenize: "forward",
              optimize: true,
              resolution: 9,
            },
            {
              field: "keywords",
              tokenize: "forward",
              optimize: true,
              resolution: 9,
            },
            {
              field: "description",
              tokenize: "forward",
              optimize: true,
              resolution: 5,
            },
            {
              field: "content",
              tokenize: "lazy",
              optimize: true,
              resolution: 1,
            },
          ],
          store: true,
        },
        context: true,
      });

      for (const doc of docs) {
        this.docs.set(doc.id, doc);
        this.index.add(doc);
      }
    } catch (error) {
      console.error("Failed to initialize FlexSearch:", error);
    }
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    if (!this.index || !query.trim()) return [];

    const results = this.index.search(query, {
      limit: options?.limit || 20,
      enrich: true,
    });

    // FlexSearch returns results grouped by field if searching multiple fields
    // or a flat array if using Document with enrich.
    // Let's flatten and unique them.
    const uniqueIds = new Set<string>();
    const searchResults: SearchResult[] = [];

    for (const fieldResult of results) {
      for (const res of fieldResult.result) {
        const id = typeof res === "string" ? res : res.id;
        if (!uniqueIds.has(id)) {
          uniqueIds.add(id);
          const doc = this.docs.get(id);
          if (doc) {
            // Apply version filter if needed
            if (options?.version && options.version !== "all" && doc.version !== options.version) {
                continue;
            }
            searchResults.push(doc);
          }
        }
      }
    }

    return searchResults;
  }

  getVersions(): string[] {
    const versions = new Set<string>();
    this.docs.forEach(doc => {
      if (doc.version) versions.add(doc.version);
    });
    return Array.from(versions);
  }
}
