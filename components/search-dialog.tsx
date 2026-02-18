"use client"

import { useEffect, useState, useMemo } from "react"
import { useFramework } from "@/core/framework"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import type { SearchResult } from "@/core/engine"
import Fuse from "fuse.js"

export function SearchDialog({ versions: initialVersions = [] }: { versions?: string[] }) {
  const [open, setOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<string | "all">("all")
  const [docs, setDocs] = useState<SearchResult[]>([])
  const [versions, setVersions] = useState<string[]>(initialVersions)
  const [loading, setLoading] = useState(true)
  const { useRouter } = useFramework()
  const router = useRouter()

  useEffect(() => {
    const initSearch = async () => {
      try {
        // Try static index first for speed and static compatibility
        const staticRes = await fetch("/search-index.json");
        if (staticRes.ok) {
          const data = await staticRes.json();
          setDocs(data);
          setLoading(false);
          // Still fetch versions via API if available, or fallback to empty
          fetch("/api/docs?type=versions")
            .then(res => res.json())
            .then(res => { if (res.success) setVersions(res.data.versions); })
            .catch(() => {});
          return;
        }

        // Fallback to API
        const [docsRes, versionsRes] = await Promise.all([
          fetch("/api/docs?type=search").then((res) => res.json()),
          fetch("/api/docs?type=versions").then((res) => res.json()),
        ]);

        if (docsRes.success) setDocs(docsRes.data.docs);
        if (versionsRes.success) setVersions(versionsRes.data.versions);
      } catch (e) {
        console.error("Failed to initialize search data:", e);
      } finally {
        setLoading(false);
      }
    };

    if (open && docs.length === 0) {
      initSearch();
    }
  }, [open, docs.length]);

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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative inline-flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground md:w-64 lg:w-96"
      >
        <span className="hidden lg:inline-flex">Search documentation...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-6 select-none items-center gap-1 rounded border border-muted bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">{typeof navigator !== 'undefined' && navigator?.platform?.includes("Mac") ? "⌘" : "Ctrl"}</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput placeholder="Search documentation..." />
        {!loading && versions.length > 1 && (
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
          {loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Loading search index...
            </div>
          ) : (
            <>
              <CommandEmpty>No results found.</CommandEmpty>
              <SearchResults
                docs={docs}
                onNavigate={handleSelect}
                selectedVersion={selectedVersion}
              />
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}

function SearchResults({
  docs,
  onNavigate,
  selectedVersion,
}: {
  docs: SearchResult[]
  onNavigate: (href: string) => void
  selectedVersion: string
}) {
  const [query, setQuery] = useState("")
  
  const fuse = useMemo(() => {
    return new Fuse(docs, {
      keys: [
        { name: 'title', weight: 0.7 },
        { name: 'content', weight: 0.3 },
        { name: 'description', weight: 0.5 },
        { name: 'keywords', weight: 0.4 }
      ],
      threshold: 0.3,
      includeMatches: true,
      minMatchCharLength: 2,
    });
  }, [docs]);

  useEffect(() => {
    const input = document.querySelector("[cmdk-input]") as HTMLInputElement
    if (input) {
      const handleChange = () => setQuery(input.value)
      setQuery(input.value)
      input.addEventListener("input", handleChange)
      return () => input.removeEventListener("input", handleChange)
    }
  }, [])

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    let filtered = fuse.search(query).map(r => r.item);
    
    if (selectedVersion !== "all") {
      filtered = filtered.filter(d => d.version === selectedVersion);
    }
    
    return filtered;
  }, [query, fuse, selectedVersion]);

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
            {Array.isArray(result.keywords) && result.keywords.length > 0 && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {result.keywords.slice(0, 5).map((keyword: string) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 leading-none h-4"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          {result.version && <Badge variant="outline" className="ml-2">{result.version}</Badge>}
        </CommandItem>
      ))}
    </CommandGroup>
  )
}

