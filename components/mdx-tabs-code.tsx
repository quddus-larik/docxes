"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "./code-block"

interface CodeTab {
  label: string
  language: string
  code: string
  filename?: string
}

interface TabsCodeBlockProps {
  tabs: CodeTab[]
  defaultTab?: number
}

export function MdxTabsCode({ tabs, defaultTab = 0 }: TabsCodeBlockProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <Tabs value={String(activeTab)} onValueChange={(val) => setActiveTab(Number(val))} className="my-4">
      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map((tab, index) => (
          <TabsTrigger key={index} value={String(index)}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab, index) => (
        <TabsContent key={index} value={String(index)}>
          <CodeBlock code={tab.code} language={tab.language} filename={tab.filename} showLineNumbers />
        </TabsContent>
      ))}
    </Tabs>
  )
}
