"use client"

import * as React from "react"
import { useEffect, useState, useMemo, useCallback } from "react"
import { useFramework } from "@/core/framework"
import { 
  Search, 
  FileText, 
  Hash, 
  ArrowRight, 
  Tag, 
  Layers,
  ChevronRight,
  History,
  FileCode,
  Sparkles,
  X
} from "lucide-react"
import type { SearchResult } from "@/core/engine"
import Fuse from "fuse.js"
import { cn } from "@/lib/utils"

// Helper to highlight search query in text
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-green-100 text-primary font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export function SearchDialog({ versions: initialVersions = [] }: { versions?: string[] }) {
  const [open, setOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<string | "all">("all")
  const [docs, setDocs] = useState<SearchResult[]>([])
  const [versions, setVersions] = useState<string[]>(initialVersions)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const { useRouter } = useFramework()
  const router = useRouter()

  const initSearch = useCallback(async () => {
    try {
      setLoading(true);
      // Try static index first for speed
      const staticRes = await fetch("/search-index.json");
      if (staticRes.ok) {
        const data = await staticRes.json();
        setDocs(data);
        
        // Load versions
        const vRes = await fetch("/api/docs?type=versions");
        if (vRes.ok) {
          const vData = await vRes.json();
          if (vData.success) setVersions(vData.data.versions);
        }
        return;
      }

      // API Fallback
      const [docsRes, versionsRes] = await Promise.all([
        fetch("/api/docs?type=search").then(r => r.json()),
        fetch("/api/docs?type=versions").then(r => r.json())
      ]);

      if (docsRes.success) setDocs(docsRes.data.docs);
      if (versionsRes.success) setVersions(versionsRes.data.versions);
    } catch (e) {
      console.error("Search init error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && docs.length === 0) {
      initSearch();
    }
  }, [open, docs.length, initSearch]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === "Escape") {
        setOpen(false)
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
        className={cn(
          "group relative flex h-10 w-full items-center justify-between rounded-full border border-input bg-muted/50 px-4 py-2 text-sm text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground hover:ring-2 hover:ring-primary/20 md:w-64 lg:w-80",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        )}
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 transition-colors group-hover:text-primary" />
          <span className="truncate">Search documentation...</span>
        </div>
        <kbd className="pointer-events-none hidden select-none items-center gap-1 rounded border border-muted-foreground/30 bg-muted-foreground/10 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:inline-flex">
          <span className="text-xs">{typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform) ? "⌘" : "Ctrl"}</span>K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="rounded-lg border border-border bg-background shadow-lg overflow-hidden">
              <div className="flex flex-col h-full max-h-[600px] overflow-hidden">
                {/* Search Input */}
                <div className="border-b border-border px-4 py-3 flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    autoFocus
                    placeholder="Search docs, keywords, or topics..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Version Filter */}
                {versions.length > 1 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border overflow-x-auto no-scrollbar">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mr-2 shrink-0">Version:</span>
                    <div className="flex gap-1.5 shrink-0">
                      <VersionPill 
                        label="All Versions" 
                        active={selectedVersion === "all"} 
                        onClick={() => setSelectedVersion("all")} 
                      />
                      {versions.map(v => (
                        <VersionPill 
                          key={v}
                          label={v} 
                          active={selectedVersion === v} 
                          onClick={() => setSelectedVersion(v)} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Results */}
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <p className="text-sm text-muted-foreground animate-pulse font-medium text-center px-4">Preparing search index...</p>
                    </div>
                  ) : (
                    <SearchResults
                      docs={docs}
                      onNavigate={handleSelect}
                      selectedVersion={selectedVersion}
                      query={query}
                    />
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-t border-border text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <kbd className="px-1 border border-border rounded bg-background">ENTER</kbd> Select
                    </span>
                    <span className="flex items-center gap-1.5">
                      <kbd className="px-1 border border-border rounded bg-background">ESC</kbd> Close
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                    <Sparkles className="h-2.5 w-2.5 text-primary" />
                    Fuzzy search enabled
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function VersionPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all duration-200 border",
        active 
          ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105" 
          : "bg-background border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-accent-foreground/20"
      )}
    >
      {label}
    </button>
  )
}

function SearchResults({
  docs,
  onNavigate,
  selectedVersion,
  query,
}: {
  docs: SearchResult[]
  onNavigate: (href: string) => void
  selectedVersion: string
  query: string
}) {
  const fuse = useMemo(() => {
    return new Fuse(docs, {
      keys: [
        { name: 'keywords', weight: 1.0 },
        { name: 'title', weight: 0.8 },
        { name: 'description', weight: 0.4 },
        { name: 'content', weight: 0.2 }
      ],
      threshold: 0.35,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
    });
  }, [docs]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    let filtered = fuse.search(query);
    
    if (selectedVersion !== "all") {
      filtered = filtered.filter(r => r.item.version === selectedVersion);
    }
    
    return filtered.slice(0, 15);
  }, [query, fuse, selectedVersion]);

  if (!query.trim()) {
    return (
      <div className="px-4 py-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Recent Documentation</h3>
        <div className="flex flex-col gap-1">
          {docs.slice(0, 5).map((doc) => (
            <button
              key={doc.id}
              onClick={() => onNavigate(doc.href)}
              className="flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-accent transition-colors text-left w-full"
            >
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <History className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-medium text-sm truncate">{doc.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{doc.version}</span>
                  {doc.description && <span className="text-[10px] text-muted-foreground/60 truncate">— {doc.description}</span>}
                </div>
              </div>
              <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground/30" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Search className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-foreground">No matches found</p>
          <p className="text-sm text-muted-foreground max-w-[250px] mx-auto mt-1">We couldn&apos;t find any results for &quot;{query}&quot;.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Found {results.length} matches</h3>
      <div className="flex flex-col gap-2">
        {results.map(({ item: result }) => (
          <button
            key={result.id}
            onClick={() => onNavigate(result.href)}
            className="flex items-start gap-4 p-3.5 rounded-lg group cursor-pointer hover:bg-accent transition-colors text-left w-full"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors border border-transparent group-hover:border-primary/20">
              {result.href.includes("features") || result.keywords?.some(k => k.includes("feature")) ? (
                <Sparkles className="h-5 w-5 text-primary" />
              ) : result.href.includes("guide") ? (
                <FileCode className="h-5 w-5 text-primary" />
              ) : (
                <Tag className="h-5 w-5 text-primary" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm leading-tight text-foreground group-hover:text-primary transition-colors">
                  <Highlight text={result.title || ""} query={query} />
                </h4>
                {result.version && (
                  <span className="text-[9px] px-1.5 py-0.5 font-black uppercase bg-muted text-muted-foreground rounded border border-border shrink-0">
                    {result.version}
                  </span>
                )}
              </div>
              
              {result.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                  <Highlight text={result.description} query={query} />
                </p>
              )}

              {Array.isArray(result.keywords) && result.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {result.keywords.slice(0, 4).map((keyword: string) => (
                    <div key={keyword} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-accent/50 text-[9px] font-medium text-accent-foreground border border-transparent group-hover:border-primary/20 transition-colors">
                      <Hash className="h-2.5 w-2.5 opacity-50" />
                      <Highlight text={keyword} query={query} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="self-start flex shrink-0 transition-all duration-300 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
              <div className="h-7 w-7 rounded-md flex items-center justify-center">
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

