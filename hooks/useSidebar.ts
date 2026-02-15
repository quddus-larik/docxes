"use client";

import { useState, useEffect, useRef } from "react";
import type { DocNavItem } from "@/types/types";
import { useSidebarCache } from "@/lib/sidebar-cache-context";

import { useSidebar } from "@/components/sidebar-context";

export function useDocSidebar(version: string, currentPath: string) {
  const { fetchVersions, fetchNavigation } = useSidebarCache();
  const { open, setOpen } = useSidebar();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<DocNavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<string[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(true);
  const loadedVersionRef = useRef<string | null>(null);

  // Fetch docs versions
  useEffect(() => {
    const getVersions = async () => {
      const data = await fetchVersions();
      setVersions(data);
      setLoadingVersions(false);
    };
    getVersions();
  }, [fetchVersions]);

  // Fetch navigation items
  useEffect(() => {
    // Only show loading when switching versions
    if (loadedVersionRef.current !== version) {
      setLoading(true);
    }

    const getNavigation = async () => {
      const data = await fetchNavigation(version);
      setItems(data);
      setLoading(false);
      loadedVersionRef.current = version;
    };
    getNavigation();
  }, [version, fetchNavigation]);

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
    loading,
    versions,
    loadingVersions,
    isActive,
    shouldExpand,
    getItemId,
  };
}
