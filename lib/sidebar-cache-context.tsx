"use client";

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import type { DocNavItem } from "@/types/types";

interface SidebarCacheContextType {
  fetchVersions: () => Promise<string[]>;
  fetchNavigation: (version: string) => Promise<DocNavItem[]>;
}

const SidebarCacheContext = createContext<SidebarCacheContextType | undefined>(undefined);

export function SidebarCacheProvider({ children }: { children: ReactNode }) {
  const versionsRef = useRef<string[] | null>(null);
  const navCacheRef = useRef(new Map<string, DocNavItem[]>());

  const fetchVersions = useCallback(async (): Promise<string[]> => {
    // Return cached versions if available
    if (versionsRef.current !== null) {
      return versionsRef.current;
    }

    try {
      const res = await fetch("/api/docs/versions");
      const data = await res.json();
      const versionList = data.versions || [];
      versionsRef.current = versionList;
      return versionList;
    } catch (err) {
      console.error("Failed to fetch versions:", err);
      return [];
    }
  }, []);

  const fetchNavigation = useCallback(async (version: string): Promise<DocNavItem[]> => {
    // Return cached navigation if available
    if (navCacheRef.current.has(version)) {
      return navCacheRef.current.get(version) || [];
    }

    try {
      const res = await fetch(`/api/docs?type=structure&version=${version}`);
      const data = await res.json();
      const nav = data.nav || [];
      navCacheRef.current.set(version, nav);
      return nav;
    } catch (err) {
      console.error(`Failed to fetch navigation for version ${version}:`, err);
      return [];
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
