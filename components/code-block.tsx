"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  highlightLines?: number[]
  showLineNumbers?: boolean
}

export function CodeBlock({
  code,
  language = "javascript",
  filename,
  highlightLines = [],
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.split("\n")

  return (
    <div className="relative my-4 overflow-hidden rounded-lg border border-border bg-muted">
      {/* Header */}
      {(filename || language) && (
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
          <div className="text-xs font-medium text-muted-foreground">
            {filename && <span>{filename}</span>}
            {filename && language && <span className="mx-2">•</span>}
            {language && <span className="uppercase">{language}</span>}
          </div>
          <Button size="sm" variant="ghost" onClick={copyToClipboard} className="h-6 w-6 p-0">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Code */}
      <div className="overflow-x-auto p-4">
        <pre className="font-mono text-sm leading-relaxed">
          <code>
            {lines.map((line, index) => (
              <div key={index} className={`${highlightLines.includes(index + 1) ? "bg-yellow-500/20" : ""}`}>
                {showLineNumbers && (
                  <span className="mr-4 text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                )}
                {line}
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}
