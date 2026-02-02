"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"
import type { DocPaginationStyles } from "@/types/interface"

interface DocPaginationProps {
  prevHref?: string
  prevTitle?: string
  nextHref?: string
  nextTitle?: string
  styles?: DocPaginationStyles
}

const defaultStyles: DocPaginationStyles = {
  container: "flex items-center justify-between gap-4 pt-8 mt-12 border-t",
  button: "flex-1 h-auto py-4 px-6 justify-start gap-4 transition-all hover:bg-muted/50",
  prevLabel: "text-xs text-muted-foreground font-medium uppercase tracking-wider",
  nextLabel: "text-xs text-muted-foreground font-medium uppercase tracking-wider",
  title: "text-base font-semibold",
};

export function DocPagination({ 
  prevHref, 
  prevTitle, 
  nextHref, 
  nextTitle,
  styles = {},
}: DocPaginationProps) {
  const s = { ...defaultStyles, ...styles };
  return (
    <div className={s.container}>
      {prevHref ? (
        <Link href={prevHref} className="flex-1">
          <Button variant="outline" className={cn(s.button, "justify-start")}>
            <ArrowLeft className="w-4 h-4" />
            <div className="text-left">
              <div className={s.prevLabel}>Previous</div>
              <div className={s.title}>{prevTitle}</div>
            </div>
          </Button>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {nextHref ? (
        <Link href={nextHref} className="flex-1">
          <Button variant="outline" className={cn(s.button, "justify-end text-right")}>
            <div className="text-right">
              <div className={s.nextLabel}>Next</div>
              <div className={s.title}>{nextTitle}</div>
            </div>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  )
}
