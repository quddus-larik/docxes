import React from "react";
import Link from "next/link";
import { XMetaConfig, HeaderProps } from "@/types/interface";
import { cn } from "@/lib/utils";
import { SearchDialog } from "@/components/search-dialog";
import { ModeToggle } from "@/components/mode-toggle";

/**
 * Shadcn UI Customization for DocX
 * A classic, high-contrast black and white aesthetic with clean borders
 * and a professional feel.
 */

export const ShadcnUI: Partial<XMetaConfig> = {
  theme: {
    cssVars: {
      light: {
        "primary": "0 0% 9%",
        "primary-foreground": "0 0% 98%",
        "secondary": "0 0% 96.1%",
        "secondary-foreground": "0 0% 9%",
        "border": "0 0% 89.8%",
        "radius": "0.5rem",
      },
      dark: {
        "primary": "0 0% 98%",
        "primary-foreground": "0 0% 9%",
        "secondary": "0 0% 14.9%",
        "secondary-foreground": "0 0% 98%",
        "border": "0 0% 14.9%",
        "radius": "0.5rem",
      }
    }
  },

  sidebar: {
    styles: {
      sidebar: "bg-background border-r w-64 shrink-0",
      nav: "px-4 py-6 space-y-1",
      item: "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
      itemActive: "bg-accent text-accent-foreground border",
      sectionTitle: "px-3 mt-4 mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50",
    },
  },

  toc: {
    styles: {
      container: "w-full",
      title: "text-sm font-bold tracking-tight mb-4",
      item: "text-xs py-1 text-muted-foreground hover:text-foreground transition-colors",
      itemActive: "text-foreground font-semibold",
    }
  },

  pagination: {
    styles: {
      container: "grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10 mt-16 border-t",
      button: "group flex flex-col gap-1 p-4 rounded-lg border bg-card transition-colors hover:bg-accent",
      title: "text-base font-bold text-foreground",
      prevLabel: "text-[10px] font-medium text-muted-foreground",
      nextLabel: "text-[10px] font-medium text-muted-foreground text-right",
    }
  },

  header: ({ siteName }: HeaderProps) => (
    <header className="sticky top-0 px-2 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
            {siteName}
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
            </nav>
        </div>
        <div className="flex items-center gap-3">
          <SearchDialog />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
};

export default ShadcnUI;
