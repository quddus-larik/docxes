"use client";

import { useState, useEffect, useRef } from "react";
import type { DocNavItem } from "@/core/engine";
import { useSidebarCache } from "@/lib/sidebar-cache-context";

import { useSidebar } from "@/components/sidebar-context";

export function useDocSidebar(version: string, currentPath: string, initialItems?: DocNavItem[], initialVersions?: string[]) {
  const { fetchVersions, fetchNavigation } = useSidebarCache();
  const { open, setOpen } = useSidebar();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<DocNavItem[]>(initialItems || []);
  const [metadata, setMetadata] = useState<{ title?: string; description?: string } | undefined>();
  const [loading, setLoading] = useState(!initialItems);
  const [versions, setVersions] = useState<string[]>(initialVersions || []);
  const [versionsMetadataMap, setVersionsMetadataMap] = useState<Record<string, { title?: string; description?: string }>>({});
  const [loadingVersions, setLoadingVersions] = useState(!initialVersions);
  const loadedVersionRef = useRef<string | null>(initialItems ? version : null);

  // Fetch docs versions
  useEffect(() => {
    if (initialVersions) return;
    const getVersions = async () => {
      const { versions: vList, metadataMap } = await fetchVersions();
      setVersions(vList);
      setVersionsMetadataMap(metadataMap);
      setLoadingVersions(false);
    };
    getVersions();
  }, [fetchVersions, initialVersions]);

  // Fetch navigation items
  useEffect(() => {
    if (initialItems && loadedVersionRef.current === version) return;
    
    // Only show loading when switching versions
    if (loadedVersionRef.current !== version) {
      setLoading(true);
    }

    const getNavigation = async () => {
      const { nav, metadata } = await fetchNavigation(version);
      setItems(nav);
      setMetadata(metadata);
      setLoading(false);
      loadedVersionRef.current = version;
    };
    getNavigation();
  }, [version, fetchNavigation, initialItems]);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const normalize = (p: string) => p.replace(/\/+$/, "");
  const isActive = (href?: string) => {
    if (!href) return false;
    return (
      normalize(currentPath) === normalize(href) ||
      normalize(currentPath).startsWith(normalize(href) + "/")
    );
  };

  const shouldExpand = (item: DocNavItem): boolean => {
    if (isActive(item.href)) return true;
    if (item.items) return item.items.some((child) => shouldExpand(child));
    return false;
  };

  const getItemId = (item: DocNavItem) => item.href ?? `folder:${item.title}`;

  return {
    open,
    setOpen,
    expandedItems,
    toggleExpanded,
    items,
    metadata,
    versions,
    versionsMetadataMap,
    loading,
    loadingVersions,
    isActive,
    shouldExpand,
    getItemId,
  };
}
