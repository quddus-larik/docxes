"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, Menu, X } from "lucide-react";
import type { DocNavItem } from "@/types/types";
import { useDocSidebar } from "@/hooks/useSidebar";

interface DocSidebarProps {
  version: string;
  currentPath: string;
}

export function DocSidebar({ version, currentPath }: DocSidebarProps) {
  const {
    open,
    setOpen,
    expandedItems,
    toggleExpanded,
    items,
    loading,
    versions,
    loadingVersions,
    isActive,
    shouldExpand,
    getItemId,
  } = useDocSidebar(version, currentPath);

  const NavItems = ({ items, depth = 0 }: { items: DocNavItem[]; depth?: number }) => (
    <ul className="space-y-1 h-full">
      {items.map((item) => {
        const expanded = expandedItems.has(getItemId(item)) || shouldExpand(item);
        const hasChildren = item.items && item.items.length > 0;

        return (
          <li key={getItemId(item)}>
            {/* File item */}
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

            {/* Folder with main.mdx */}
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
                  <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
              </div>
            )}

            {hasChildren && !item.href && (
              <button
                onClick={() => toggleExpanded(getItemId(item))}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50`}
                style={{ paddingLeft: `${depth * 12 + 12}px` }}
              >
                <span>{item.title}</span>
                <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} />
              </button>
            )}

            {hasChildren && expanded && <NavItems items={item.items ?? []} depth={depth + 1} />}
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

              {loading ? <div className="px-3 py-2 text-xs text-sidebar-foreground/50">Loading...</div> : <NavItems items={items} />}
            </div>
          </nav>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
