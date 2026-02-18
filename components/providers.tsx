"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarCacheProvider } from "@/lib/sidebar-cache-context";

import { SidebarProvider } from "@/components/sidebar-context";
import { DocxesFrameworkProvider } from "@/core/framework";
import { NextFramework } from "@/core/next-framework";

export function Providers({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <DocxesFrameworkProvider framework={NextFramework}>
        <SidebarCacheProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </SidebarCacheProvider>
      </DocxesFrameworkProvider>
    </NextThemesProvider>
  );
}
