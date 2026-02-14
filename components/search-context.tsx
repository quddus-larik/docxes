"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SearchProviderInterface, SearchResult, SearchOptions } from "@/lib/search/types";
import { LocalSearchProvider } from "@/lib/search/providers/local";
import { FlexSearchProvider } from "@/lib/search/providers/flexsearch";
import { XMeta } from "@/x-meta.config";

interface SearchContextType {
  provider: SearchProviderInterface | null;
  search: (query: string, options?: SearchOptions) => Promise<SearchResult[]>;
  isReady: boolean;
  versions: string[];
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: React.ReactNode;
  provider?: SearchProviderInterface; // Allow injection
}

export function SearchProvider({ children, provider: customProvider }: SearchProviderProps) {
  const [provider, setProvider] = useState<SearchProviderInterface | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [versions, setVersions] = useState<string[]>([]);

  useEffect(() => {
    const initProvider = async () => {
      let activeProvider = customProvider;

      if (!activeProvider) {
        // Factory logic based on config
        switch (XMeta.searchProvider) {
            case 'local':
                activeProvider = new LocalSearchProvider();
                break;
            case 'flexsearch':
                activeProvider = new FlexSearchProvider();
                break;
            // Add other providers here (e.g. 'algolia')
            default:
                if (XMeta.searchProvider !== '<void>') {
                   console.warn(`Unknown search provider '${XMeta.searchProvider}', falling back to local.`);
                }
                activeProvider = new LocalSearchProvider();
                break;
        }
      }
      
      if (activeProvider) {
          await activeProvider.initialize();
          setProvider(activeProvider);
          setVersions(activeProvider.getVersions());
      }
      
      setIsReady(true);
    };

    initProvider();
  }, [customProvider]);

  const search = async (query: string, options?: SearchOptions) => {
    if (!provider) return [];
    return provider.search(query, options);
  };

  return (
    <SearchContext.Provider value={{ provider, search, isReady, versions }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
