"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SearchProvider } from "@/components/search-context";
import { SidebarCacheProvider } from "@/lib/sidebar-cache-context";

import { SidebarProvider } from "@/components/sidebar-context";

export function Providers({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <SidebarCacheProvider>
        <SidebarProvider>
          <SearchProvider>
            {children}
          </SearchProvider>
        </SidebarProvider>
      </SidebarCacheProvider>
    </NextThemesProvider>
  );
}
