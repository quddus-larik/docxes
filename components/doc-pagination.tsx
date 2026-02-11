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
  container: "flex flex-col sm:flex-row items-stretch justify-between gap-4 pt-8 mt-12 border-t",
  button: "flex items-center gap-4 p-4 rounded-lg border bg-background transition-colors hover:bg-primary/5 hover:border-primary/50 no-underline group",
  prevLabel: "text-xs text-muted-foreground font-medium uppercase tracking-wider group-hover:text-primary/70",
  nextLabel: "text-xs text-muted-foreground font-medium uppercase tracking-wider group-hover:text-primary/70",
  title: "text-base font-semibold text-foreground group-hover:text-primary",
};

export function DocPagination({ 
  prev, 
  next,
  styles = {},
}: DocPaginationProps) {
  const s = { ...defaultStyles, ...styles };
  
  return (
    <div className={s.container}>
      {prev ? (
        <Link href={prev.href} className={cn("flex-1", s.button)}>
          <ArrowLeft className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary" />
          <div className="flex flex-col text-left">
            <span className={s.prevLabel}>Previous</span>
            <span className={s.title}>{prev.title}</span>
          </div>
        </Link>
      ) : (
        <div className="flex-1 hidden sm:block" />
      )}

      {next ? (
        <Link href={next.href} className={cn("flex-1 justify-end text-right", s.button)}>
          <div className="flex flex-col">
            <span className={s.nextLabel}>Next</span>
            <span className={s.title}>{next.title}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary" />
        </Link>
      ) : (
        <div className="flex-1 hidden sm:block" />
      )}
    </div>
  )
}
