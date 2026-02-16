import { DocxesOutput } from "./types";

export interface SearchIndexItem {
  id: string;
  title: string;
  content: string;
  slug: string;
  version: string;
}

export class SearchIndexer {
  private index: SearchIndexItem[] = [];

  add(item: SearchIndexItem) {
    this.index.push(item);
  }

  export() {
    return JSON.stringify(this.index);
  }

  // Integration with FlexSearch or similar could go here
}
