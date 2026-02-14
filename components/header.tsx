"use client"

import React from "react"
import Link from "next/link"
import { SearchDialog } from "./search-dialog"
import { cn } from "@/lib/utils"
import { XMeta } from "@/x-meta.config"

export interface HeaderProps {
  siteName?: string
  className?: string
}

export function Header({ siteName = "DocX", className }: HeaderProps) {
  const ModeToggle = XMeta.modeToggle;
  
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container flex h-14 items-center gap-4">
        <div className="flex mr-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl sm:inline-block">
              {siteName}
            </span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <SearchDialog />
          </div>
          <nav className="flex items-center gap-2">
            {ModeToggle && <ModeToggle />}
          </nav>
        </div>
      </div>
    </header>
  )
}
