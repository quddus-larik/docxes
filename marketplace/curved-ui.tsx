import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { XMetaConfig, HeaderProps } from "@/types/interface";
import { cn } from "@/lib/utils";
import { SearchDialog } from "@/components/search-dialog";
import { ModeToggle } from "@/components/mode-toggle";

/**
 * Curved UI Customization for DocX
 * This "formula" provides a soft, rounded aesthetic with pill-shaped elements 
 * and elevated surfaces.
 */

export const CurvedUI: Partial<XMetaConfig> = {
  theme: {
    cssVars: {
      light: {
        "primary": "oklch(0.6 0.25 260)",
        "primary-foreground": "oklch(0.98 0 0)",
        "secondary": "oklch(0.95 0.02 260)",
        "radius": "1rem",
      },
      dark: {
        "primary": "oklch(0.7 0.2 260)",
        "primary-foreground": "oklch(0.1 0 0)",
        "secondary": "oklch(0.2 0.05 260)",
        "radius": "1rem",
      }
    }
  },

  sidebar: {
    header: ({ version }: { version: string }) => (
      <div className="px-6 py-6 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
            D
          </div>
          <div className="font-extrabold text-xl tracking-tight">DocX</div>
        </div>
        <div className="flex px-1">
          <Badge variant="secondary" className="rounded-full px-3 py-0 text-[10px] font-bold uppercase tracking-wider">
            Edition {version}
          </Badge>
        </div>
      </div>
    ),
    styles: {
      sidebar: "bg-background/50 backdrop-blur-md border-r-0 w-80 shrink-0",
      nav: "px-4 pb-8 space-y-2",
      item: "flex items-center gap-3 rounded-full px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-primary/5 hover:text-primary hover:pl-6",
      itemActive: "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:text-primary-foreground hover:bg-primary",
      sectionTitle: "px-5 pt-8 pb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40",
    },
  },

  toc: {
    styles: {
      container: "sticky top-24 w-full p-6 rounded-[2rem] bg-secondary/30 backdrop-blur-sm border border-border/50",
      title: "text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-primary before:rounded-full",
      item: "rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 text-muted-foreground hover:text-primary hover:bg-primary/5",
      itemActive: "bg-primary/10 text-primary font-bold pl-5",
    }
  },

  pagination: {
    styles: {
      container: "grid grid-cols-2 gap-6 pt-12 mt-20 border-t border-dashed",
      button: "flex flex-col gap-2 p-8 rounded-[2rem] border-2 border-transparent bg-secondary/50 transition-all duration-300 hover:bg-primary/5 hover:border-primary/20 hover:scale-[1.02] group",
      title: "text-lg font-bold text-foreground group-hover:text-primary transition-colors",
      prevLabel: "text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50",
      nextLabel: "text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 text-right",
    }
  },

  header: ({ siteName, versions }: HeaderProps) => (
    <header className="sticky top-4 z-50 w-[calc(100%-2rem)] mx-auto mt-4 rounded-full border bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5">
      <div className="container flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-black text-xl tracking-tighter hover:opacity-80 transition-opacity">
            {siteName}
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/docs" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Docs</Link>
            </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <SearchDialog />
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
};

export default CurvedUI;
