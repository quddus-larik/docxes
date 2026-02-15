"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  items?: DocNavItem[];
  versions?: string[];
  item?: React.ComponentType<{ item: DocNavItem; isActive: boolean; depth: number; onClick: () => void }>;
  styles?: DocSidebarStyles;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const defaultStyles: DocSidebarStyles = {
  sidebar:
    "bg-background border-r border-border w-72 flex flex-col shrink-0",
  nav:
    "flex-1 space-y-1 px-3 py-4",
  item:
    "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
  itemActive:
    "bg-primary/10 text-primary font-medium",
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
  items: initialItems,
  versions: initialVersions,
  item: ItemComponent,
  styles = {},
  header,
  footer,
}: DocSidebarProps) {
  const s = { ...defaultStyles, ...styles };
  const router = useRouter();

  const {
    open,
    setOpen,
    expandedItems,
    toggleExpanded,
    items: hookItems,
    loading,
    versions: hookVersions,
    loadingVersions,
    isActive,
    shouldExpand,
    getItemId,
  } = useDocSidebar(version, currentPath);

  const items = initialItems || hookItems;
  const versions = initialVersions || hookVersions;
  const isNavLoading = !initialItems && loading;
  const isVersionsLoading = !initialVersions && loadingVersions;

  const NavItems = ({
    items,
    depth = 0,
  }: {
    items: DocNavItem[];
    depth?: number;
  }) => (
    <ul className="flex flex-col gap-1 list-none p-0 m-0">
      {items.map((item) => {
        const expanded =
          expandedItems.has(getItemId(item)) || shouldExpand(item);
        const hasChildren = !!item.items?.length;

        const baseItem = cn(
          s.item,
          isActive(item.href) && s.itemActive
        );

        const paddingLeft = {
          paddingLeft: `${depth * 12 + 12}px`,
        };

        const active = isActive(item.href);
        const onClick = () => setOpen(false);

        if (ItemComponent) {
          return (
            <li key={getItemId(item)} className="list-none">
              <ItemComponent item={item} isActive={active} depth={depth} onClick={onClick} />
              {hasChildren && expanded && (
                <NavItems items={item.items!} depth={depth + 1} />
              )}
            </li>
          );
        }

        return (
          <li key={getItemId(item)} className="list-none">
            {/* File */}
            {!hasChildren && item.href && (
              <Link
                href={item.href}
                onClick={onClick}
                className={baseItem}
                style={paddingLeft}
              >
                {item.title}
              </Link>
            )}

            {/* Folder */}
            {hasChildren && (
              <div className="flex flex-col">
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
                      "p-2 rounded transition-colors bg-transparent border-0 cursor-pointer",
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
                {expanded && (
                  <NavItems
                    items={item.items!}
                    depth={depth + 1}
                  />
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-10 transition-transform duration-200 lg:sticky lg:top-14 lg:self-start lg:translate-x-0 h-full lg:min-h-[calc(100vh-3.5rem)]",
          s.sidebar,
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {header}
        
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className={cn("flex flex-col gap-4", s.nav)}>
            {isNavLoading ? (
              <div className="px-3 py-2 text-xs text-muted-foreground italic">
                Loading navigation…
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
            "fixed inset-0 z-20 lg:hidden bg-black/40 backdrop-blur-sm",
            s.overlay
          )}
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
