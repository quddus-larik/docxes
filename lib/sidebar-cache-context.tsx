"use client";

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import type { DocNavItem } from "@/core/engine";

interface SidebarCacheContextType {
  fetchVersions: () => Promise<{ versions: string[]; metadataMap: Record<string, { title?: string; description?: string }> }>;
  fetchNavigation: (version: string) => Promise<{ nav: DocNavItem[]; metadata?: { title?: string; description?: string } }>;
}

const SidebarCacheContext = createContext<SidebarCacheContextType | undefined>(undefined);

export function SidebarCacheProvider({ children }: { children: ReactNode }) {
  const versionsDataRef = useRef<{ versions: string[]; metadataMap: Record<string, { title?: string; description?: string }> } | null>(null);
  const navCacheRef = useRef(new Map<string, { nav: DocNavItem[]; metadata?: { title?: string; description?: string } }>());

  const fetchVersions = useCallback(async (): Promise<{ versions: string[]; metadataMap: Record<string, { title?: string; description?: string }> }> => {
    // Return cached versions if available
    if (versionsDataRef.current !== null) {
      return versionsDataRef.current;
    }

    try {
      const res = await fetch("/api/docs/versions");
      const data = await res.json();
      const versionList = data.versions || [];
      const metadataMap = data.versionsMetadata || {};
      const result = { versions: versionList, metadataMap };
      versionsDataRef.current = result;
      return result;
    } catch (err) {
      console.error("Failed to fetch versions:", err);
      return { versions: [], metadataMap: {} };
    }
  }, []);

  const fetchNavigation = useCallback(async (version: string): Promise<{ nav: DocNavItem[]; metadata?: { title?: string; description?: string } }> => {
    // Return cached navigation if available
    if (navCacheRef.current.has(version)) {
      return navCacheRef.current.get(version) || { nav: [] };
    }

    try {
      const res = await fetch(`/api/docs?type=structure&version=${version}`);
      const data = await res.json();
      const nav = data.nav || [];
      const metadata = data.metadata;
      const result = { nav, metadata };
      navCacheRef.current.set(version, result);
      return result;
    } catch (err) {
      console.error(`Failed to fetch navigation for version ${version}:`, err);
      return { nav: [] };
    }
  }, []);

  return (
    <SidebarCacheContext.Provider
      value={{
        fetchVersions,
        fetchNavigation,
      }}
    >
      {children}
    </SidebarCacheContext.Provider>
  );
}

export function useSidebarCache() {
  const context = useContext(SidebarCacheContext);
  if (context === undefined) {
    throw new Error("useSidebarCache must be used within SidebarCacheProvider");
  }
  return context;
}
