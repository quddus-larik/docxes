"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"
import type { DocPaginationStyles } from "@/types/interface"

interface DocPaginationProps {
  prev?: { href: string; title: string } | null;
  next?: { href: string; title: string } | null;
  styles?: DocPaginationStyles;
}

const defaultStyles: DocPaginationStyles = {
  container: "grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10 mt-16 border-t",
  button: "group flex flex-col gap-2 p-6 rounded-xl border bg-card transition-all hover:bg-accent hover:border-primary/30 no-underline shadow-sm hover:shadow-md",
  prevLabel: "flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors",
  nextLabel: "flex items-center gap-2 justify-end text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors text-right",
  title: "text-lg font-bold text-foreground transition-colors group-hover:translate-x-1 duration-300",
};

export function DocPagination({ 
  prev, 
  next,
  styles = {},
}: DocPaginationProps) {
  const s = { ...defaultStyles, ...styles };
  
  return (
    <nav className={s.container} aria-label="Pagination">
      {prev ? (
        <Link href={prev.href} className={s.button}>
          <span className={s.prevLabel}>
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
            Previous
          </span>
          <span className={cn(s.title, "group-hover:-translate-x-1")}>{prev.title}</span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next ? (
        <Link href={next.href} className={cn(s.button, "text-right items-end")}>
          <span className={s.nextLabel}>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            Next
          </span>
          <span className={s.title}>{next.title}</span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </nav>
  )
}
