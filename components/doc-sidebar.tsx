"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Menu, X } from "lucide-react";
import type { DocNavItem } from "@/types/types";
import { useDocSidebar } from "@/hooks/useSidebar";
import { SidebarCacheProvider } from "@/lib/sidebar-cache-context";
import { cn } from "@/lib/utils";

export interface DocSidebarStyles {
  sidebar?: string;
  nav?: string;
  item?: string;
  itemActive?: string;
  itemWrapper?: string;
  sectionTitle?: string;
  toggleBtn?: string;
  overlay?: string;
}

interface DocSidebarProps {
  version: string;
  currentPath: string;
  styles?: DocSidebarStyles;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const defaultStyles: DocSidebarStyles = {
  sidebar:
    "bg-background border-r border-border w-72 flex flex-col",
  nav:
    "flex-1 space-y-1 overflow-y-auto px-3 py-4",
  item:
    "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
  itemActive:
    "bg-muted text-foreground font-medium",
  sectionTitle:
    "px-3 pt-4 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
  toggleBtn:
    "text-muted-foreground hover:text-foreground",
  overlay:
    "bg-black/40 backdrop-blur-sm",
};

export function DocSidebar({
  version,
  currentPath,
  styles = {},
  header,
  footer,
}: DocSidebarProps) {
  const s = { ...defaultStyles, ...styles };

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

  const NavItems = ({
    items,
    depth = 0,
  }: {
    items: DocNavItem[];
    depth?: number;
  }) => (
    <ul className="space-y-1">
      {items.map((item) => {
        const expanded =
          expandedItems.has(getItemId(item)) || shouldExpand(item);
        const hasChildren = !!item.items?.length;

        const baseItem = cn(
          s.item,
          isActive(item.href) && s.itemActive
        );

        const paddingLeft = {
          paddingLeft: depth * 12 + 12,
        };

        return (
          <li key={getItemId(item)}>
            {/* File */}
            {!hasChildren && item.href && (
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={baseItem}
                style={paddingLeft}
              >
                {item.title}
              </Link>
            )}

            {/* Folder */}
            {hasChildren && (
              <div className="flex items-center">
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(baseItem, "flex-1")}
                    style={paddingLeft}
                  >
                    {item.title}
                  </Link>
                ) : (
                  <button
                    onClick={() => toggleExpanded(getItemId(item))}
                    className={cn(baseItem, "flex-1 text-left")}
                    style={paddingLeft}
                  >
                    {item.title}
                  </button>
                )}
                <button
                  onClick={() => toggleExpanded(getItemId(item))}
                  className={cn(
                    "p-2 rounded transition-colors",
                    s.toggleBtn
                  )}
                >
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      expanded && "rotate-180"
                    )}
                  />
                </button>
              </div>
            )}

            {hasChildren && expanded && (
              <NavItems
                items={item.items!}
                depth={depth + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <SidebarCacheProvider>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 lg:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 transition-transform duration-200 lg:relative lg:translate-x-0 h-full",
          s.sidebar,
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {header}
        
        <div className="flex-1 overflow-y-auto px-3 pt-16 lg:pt-4">
          <nav className={s.nav}>
            {loadingVersions ? (
              <div className={s.sectionTitle}>
                Loading…
              </div>
            ) : versions.length > 1 ? (
              <Select
                value={version}
                onValueChange={(v) =>
                  (window.location.href = `/docs/${v}`)
                }
              >
                <SelectTrigger className="mb-3 h-9">
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
              <div className={s.sectionTitle}>
                {version.toUpperCase()}
              </div>
            )}

            {loading ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Loading…
              </div>
            ) : (
              <NavItems items={items} />
            )}
          </nav>
        </div>

        {footer}
      </aside>

      {/* Overlay */}
      {open && (
        <div
          className={cn(
            "fixed inset-0 z-20 lg:hidden",
            s.overlay
          )}
          onClick={() => setOpen(false)}
        />
      )}
    </SidebarCacheProvider>
  );
}
