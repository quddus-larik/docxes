"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { useSearch } from "@/components/search-context"
import { SearchResult } from "@/lib/search/types"

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<string | "all">("all")
  const { search, versions, isReady } = useSearch()
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  // If search provider is not ready, we could show a loading state or nothing
  // But usually the button should be visible.
  
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative inline-flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground md:w-64 lg:w-96"
        disabled={!isReady}
      >
        <span className="hidden lg:inline-flex">Search documentation...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-6 select-none items-center gap-1 rounded border border-muted bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">{typeof navigator !== 'undefined' && navigator?.platform?.includes("Mac") ? "⌘" : "Ctrl"}</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput placeholder="Search documentation..." />
        {versions.length > 1 && (
          <div className="border-b px-2 py-2">
            <div className="text-xs font-semibold text-muted-foreground mb-2">Version:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedVersion("all")}
                className={`px-2 py-1 rounded text-sm ${selectedVersion === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                All
              </button>
              {versions.map((version) => (
                <button
                  key={version}
                  onClick={() => setSelectedVersion(version)}
                  className={`px-2 py-1 rounded text-sm ${selectedVersion === version ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                >
                  {version}
                </button>
              ))}
            </div>
          </div>
        )}

        <CommandList className="max-h-[450px]">
          <CommandEmpty>No results found.</CommandEmpty>
          <SearchResults
            search={search}
            onNavigate={handleSelect}
            selectedVersion={selectedVersion}
          />
        </CommandList>
      </CommandDialog>
    </>
  )
}

function SearchResults({
  search,
  onNavigate,
  selectedVersion,
}: {
  search: (query: string, options?: any) => Promise<SearchResult[]>
  onNavigate: (href: string) => void
  selectedVersion: string
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    const input = document.querySelector("[cmdk-input]") as HTMLInputElement
    if (input) {
      const handleChange = () => setQuery(input.value)
      // Initial value
      setQuery(input.value)
      
      input.addEventListener("input", handleChange)
      return () => input.removeEventListener("input", handleChange)
    }
  }, [])

  useEffect(() => {
    let active = true;
    const performSearch = async () => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        
        const res = await search(query, { version: selectedVersion });
        if (active) setResults(res);
    };
    
    // Debounce could be added here, but for local it's fast
    const timer = setTimeout(performSearch, 150);
    return () => {
        active = false;
        clearTimeout(timer);
    }
  }, [query, selectedVersion, search]);


  if (!query.trim()) return null

  return (
    <CommandGroup heading={`Results (${results.length})`}>
      {results.map((result) => (
        <CommandItem
          key={result.id}
          value={result.title}
          onSelect={() => onNavigate(result.href)}
          className="cursor-pointer overflow-hidden"
        >
          <div className="flex-1">
            <div className="font-medium text-sm">{result.title}</div>
            {result.description && <div className="text-xs text-muted-foreground line-clamp-1">{result.description}</div>}
            {result.keywords && result.keywords.length > 0 && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {result.keywords
                  .sort((a, b) => {
                    const aMatch = a.toLowerCase().includes(query.toLowerCase())
                    const bMatch = b.toLowerCase().includes(query.toLowerCase())
                    if (aMatch && !bMatch) return -1
                    if (!aMatch && bMatch) return 1
                    return 0
                  })
                  .slice(0, 5)
                  .map((keyword: string) => {
                    const isMatch = keyword.toLowerCase().includes(query.toLowerCase())
                    return (
                      <Badge
                        key={keyword}
                        variant={isMatch ? "default" : "secondary"}
                        className="text-[10px] px-1.5 py-0 leading-none h-4"
                      >
                        {keyword}
                      </Badge>
                    )
                  })}
              </div>
            )}
          </div>
          {result.version && <Badge variant="outline" className="ml-2">{result.version}</Badge>}
        </CommandItem>
      ))}
    </CommandGroup>
  )
}

