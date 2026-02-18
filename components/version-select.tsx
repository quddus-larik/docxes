"use client"

import * as React from "react"
import { useFramework } from "@/core/framework"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface VersionSelectProps {
  versions: string[]
  currentVersion: string
  className?: string
}

export function VersionSelect({ 
  versions, 
  currentVersion, 
  className,
}: VersionSelectProps) {
  const { useRouter } = useFramework()
  const router = useRouter()

  return (
    <Select
      value={currentVersion}
      onValueChange={(value) => {
        router.push(`/docs/${value}`)
      }}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {versions.map((v) => (
            <SelectItem key={v} value={v} className="uppercase font-medium">
              {v}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
