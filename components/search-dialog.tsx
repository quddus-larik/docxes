"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Fuse from "fuse.js"
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
import type { NavItem, SearchableDoc } from "@/types/types"

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [docs, setDocs] = useState<SearchableDoc[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string | "all">("all")
  const [versions, setVersions] = useState<string[]>([])
  const [fuse, setFuse] = useState<any>(null) // use any to avoid TS error
  const router = useRouter()

  // Initialize search index
  useEffect(() => {
    async function initializeSearch() {
      try {
        const response = await fetch("/api/docs/search")
        const data = await response.json()
        setDocs(data.docs)

        // Extract unique versions
        const uniqueVersions = Array.from(new Set(data.docs.map((doc: SearchableDoc) => doc.version)))
        setVersions(uniqueVersions as any)

        // Initialize Fuse
        setFuse(new Fuse(data.docs, {
          keys: [
            { name: "title", weight: 10 },
            { name: "description", weight: 5 },
            { name: "keywords", weight: 8 },
            { name: "content", weight: 1 },
          ],
          threshold: 0.3,
          minMatchCharLength: 2,
        }))
      } catch (error) {
        console.error("Failed to initialize search:", error)
      }
    }

    initializeSearch()
  }, [])

  const handleSearch = useCallback(
    (query: string) => {
      if (!fuse || !query.trim()) return []
      let results = fuse.search(query)
      if (selectedVersion !== "all") {
        results = results.filter((result: any) => result.item.version === selectedVersion)
      }
      return results
    },
    [fuse, selectedVersion],
  )

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
          <span className="text-xs">{navigator?.platform?.includes("Mac") ? "⌘" : "Ctrl"}</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search documentation..." />
        <CommandList>
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

          <Command shouldFilter={false}>
            <CommandList className="max-h-75 my-2">
              <CommandEmpty>No results found.</CommandEmpty>
              <SearchResults
                onSelect={handleSearch}
                onNavigate={handleSelect}
                selectedVersion={selectedVersion}
                allDocs={docs}
              />
            </CommandList>
          </Command>
        </CommandList>
      </CommandDialog>
    </>
  )
}

function SearchResults({
  onSelect,
  onNavigate,
  selectedVersion,
  allDocs,
}: {
  onSelect: (query: string) => any[]
  onNavigate: (href: string) => void
  selectedVersion: string
  allDocs: SearchableDoc[]
}) {
  const [query, setQuery] = useState("")
  const [fuse, setFuse] = useState<any>(null)

  useEffect(() => {
    setFuse(new Fuse(allDocs, {
      keys: [
        { name: "title", weight: 10 },
        { name: "description", weight: 5 },
        { name: "keywords", weight: 8 },
        { name: "content", weight: 1 },
      ],
      threshold: 0.3,
      minMatchCharLength: 2,
    }))
  }, [allDocs])

  useEffect(() => {
    const input = document.querySelector("[cmdk-input]") as HTMLInputElement
    if (input) {
      const handleChange = () => setQuery(input.value)
      input.addEventListener("input", handleChange)
      return () => input.removeEventListener("input", handleChange)
    }
  }, [])

  if (!fuse || !query.trim()) return null

  let results = fuse.search(query)
  if (selectedVersion !== "all") {
    results = results.filter((r: any) => r.item.version === selectedVersion)
  }

  return (
    <CommandGroup heading={`Results (${results.length})`}>
      {results.map((result: any) => (
        <CommandItem
          key={result.item.id}
          value={result.item.title}
          onSelect={() => onNavigate(result.item.href)}
          className="cursor-pointer"
        >
          <div className="flex-1">
            <div className="font-medium text-sm">{result.item.title}</div>
            {result.item.description && <div className="text-xs text-muted-foreground line-clamp-1">{result.item.description}</div>}
            {result.item.keywords && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {result.item.keywords.slice(0, 3).map((keyword: string) => (
                  <Badge key={keyword} variant="secondary" className="text-[10px]">{keyword}</Badge>
                ))}
              </div>
            )}
          </div>
          <Badge variant="outline" className="ml-2">{result.item.version}</Badge>
        </CommandItem>
      ))}
    </CommandGroup>
  )
}
