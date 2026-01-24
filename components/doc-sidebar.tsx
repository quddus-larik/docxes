"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DocNavItem } from "@/types/types";

interface DocSidebarProps {
  currentPath: string;
  version: string;
}

export function DocSidebar({ currentPath, version }: DocSidebarProps) {
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<DocNavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<string[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(true);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch("/api/docs/versions");
        const data = await response.json();
        setVersions(data.versions || []);
      } catch (error) {
        console.error("Failed to fetch versions:", error);
      } finally {
        setLoadingVersions(false);
      }
    };

    fetchVersions();
  }, []);

  console.warn("Nav items my me", items);
  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const response = await fetch(`/api/docs/structure?version=${version}`);
        const data = await response.json();
        console.log("Navigation structure:", data.nav);
        setItems(data.nav || []);
      } catch (error) {
        console.error("Failed to fetch navigation:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNavigation();
  }, [version]);

  const toggleExpanded = (id: string) => {
  setExpandedItems(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
}


  const normalize = (p: string) => p.replace(/\/+$/, "")

const isActive = (href?: string) => {
  if (!href) return false
  return (
    normalize(currentPath) === normalize(href) ||
    normalize(currentPath).startsWith(normalize(href) + "/")
  )
}


  const shouldExpand = (item: DocNavItem): boolean => {
    if (isActive(item.href)) return true;
    if (item.items) {
      return item.items.some((child) => shouldExpand(child));
    }
    return false;
  };

  
  const getItemId = (item: DocNavItem) => item.href ?? `folder:${item.title}`
  const NavItems = ({
    items,
    depth = 0,
  }: {
    items: DocNavItem[];
    depth?: number;
  }) => (
    <ul className="space-y-1">
      {items.map((item, idx) => {
        const expanded = expandedItems.has(getItemId(item)) || shouldExpand(item);
        const hasChildren = item.items && item.items.length > 0;

        return (
          <li key={getItemId(item)}>
            {/* File item - no children, just a link */}
            {!hasChildren && item.href && (
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
                style={{ paddingLeft: `${depth * 12 + 12}px` }}
              >
                {item.title}
              </Link>
            )}

            {/* Folder with main.mdx file - text is clickable link, arrow is for collapse */}
            {hasChildren && item.href && (
              <div className="flex items-center">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex-1 flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                  style={{ paddingLeft: `${depth * 12 + 12}px` }}
                >
                  {item.title}
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleExpanded(item.title);
                  }}
                  className="p-1 hover:bg-sidebar-accent/50 rounded transition-colors shrink-0 mr-2"
                  aria-label="Toggle folder"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            )}

            {/* Folder without main.mdx file - only arrow for collapse, no link */}
            {hasChildren && !item.href && (
              <button
                onClick={() => toggleExpanded(getItemId(item))}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50`}
                style={{ paddingLeft: `${depth * 12 + 12}px` }}
              >
                <span>{item.title}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
                />
              </button>
            )}

            {/* Render children if expanded */}
            {hasChildren && expanded && (
              <NavItems items={item.items ?? []} depth={depth + 1} />
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 lg:hidden z-40"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200 lg:relative lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto p-4 pt-16 lg:pt-4">
          <nav className="space-y-8">
            <div>
              {loadingVersions ? (
                <div className="px-3 pb-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                  Loading versions...
                </div>
              ) : versions.length > 1 ? (
                <Select
                  value={version}
                  onValueChange={(newVersion) => {
                    window.location.href = `/docs/${newVersion}`;
                  }}
                >
                  <SelectTrigger className="mb-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <h3 className="px-3 pb-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                  {version.toUpperCase()}
                </h3>
              )}
              {loading ? (
                <div className="px-3 py-2 text-xs text-sidebar-foreground/50">
                  Loading...
                </div>
              ) : (
                <NavItems items={items} />
              )}
            </div>
          </nav>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
