import React from "react";
import Link from "next/link";
import { XMetaConfig, HeaderProps } from "@/types/interface";
import { ModeToggle } from "@/components/mode-toggle";
import { SearchDialog } from "@/components/search-dialog";

/**
 * Minimal UI Customization for DocX
 * A clean, spacious, and extremely focused aesthetic with no borders.
 */

export const MinimalUI: Partial<XMetaConfig> = {
  theme: {
    cssVars: {
      light: {
        "primary": "oklch(0.2 0 0)",
        "secondary": "oklch(0.98 0 0)",
        "border": "transparent",
      },
      dark: {
        "primary": "oklch(0.98 0 0)",
        "secondary": "oklch(0.15 0 0)",
        "border": "transparent",
      }
    }
  },

  sidebar: {
    styles: {
      sidebar: "bg-background w-64 border-r-0 shrink-0",
      nav: "px-6 py-12",
      item: "px-0 py-2 text-sm font-medium border-l-2 border-transparent transition-all hover:pl-2 hover:text-primary",
      itemActive: "border-primary text-primary pl-2 bg-transparent",
      sectionTitle: "px-0 pt-8 pb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30",
    },
  },

  toc: {
    styles: {
      container: "w-full",
      title: "text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30 mb-8",
      item: "px-0 py-1.5 text-xs text-muted-foreground hover:text-primary transition-colors",
      itemActive: "text-primary font-medium",
    }
  },

  pagination: {
    styles: {
      container: "flex items-center justify-between pt-20 mt-32",
      button: "bg-transparent border-0 p-0 flex flex-col gap-1 group",
      title: "text-sm font-medium text-foreground group-hover:underline",
      prevLabel: "text-[9px] uppercase tracking-widest text-muted-foreground/40",
      nextLabel: "text-[9px] uppercase tracking-widest text-muted-foreground/40",
    }
  }
};

export default MinimalUI;
