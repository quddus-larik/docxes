"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DocPaginationProps {
  prevHref?: string
  prevTitle?: string
  nextHref?: string
  nextTitle?: string
}

export function DocPagination({ prevHref, prevTitle, nextHref, nextTitle }: DocPaginationProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-8 border-t border-border">
      {prevHref ? (
        <Link href={prevHref} className="flex-1">
          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            <div className="text-left">
              <div className="text-xs text-muted-foreground">Previous</div>
              <div className="text-sm font-medium">{prevTitle}</div>
            </div>
          </Button>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {nextHref ? (
        <Link href={nextHref} className="flex-1">
          <Button variant="outline" className="w-full justify-end gap-2 bg-transparent">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Next</div>
              <div className="text-sm font-medium">{nextTitle}</div>
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
