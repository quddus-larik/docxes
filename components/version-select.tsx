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
  versionsMetadataMap?: Record<string, { title?: string; description?: string }>
  className?: string
}

export function VersionSelect({ 
  versions, 
  currentVersion, 
  versionsMetadataMap = {},
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
        <SelectValue>
          {versionsMetadataMap[currentVersion]?.title || currentVersion}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {versions.map((v) => (
            <SelectItem key={v} value={v} className="font-medium">
              {versionsMetadataMap[v]?.title || v}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
