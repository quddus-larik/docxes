"use client";

import { useState, useEffect } from "react";
import type { DocNavItem } from "@/types/types";

export function useDocSidebar(version: string, currentPath: string) {
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<DocNavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<string[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(true);

  // Fetch docs versions
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const res = await fetch("/api/docs/versions");
        const data = await res.json();
        setVersions(data.versions || []);
      } catch (err) {
        console.error("Failed to fetch versions:", err);
      } finally {
        setLoadingVersions(false);
      }
    };
    fetchVersions();
  }, []);

  // Fetch navigation items
  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const res = await fetch(`/api/docs/structure?version=${version}`);
        const data = await res.json();
        setItems(data.nav || []);
      } catch (err) {
        console.error("Failed to fetch navigation:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNavigation();
  }, [version]);

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
