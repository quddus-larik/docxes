"use client"

import { useEffect, useState } from "react"
import type { DocHeading } from "@/types/types"

interface DocTOCProps {
  headings: DocHeading[]
}

export function DocTOC({ headings }: DocTOCProps) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map((h) => ({
        id: h.id,
        element: document.getElementById(h.id),
        level: h.level,
      }))

      let activeHeading = ""

      for (const heading of headingElements) {
        if (!heading.element) continue
        const rect = heading.element.getBoundingClientRect()

        if (rect.top <= 100) {
          activeHeading = heading.id
        } else {
          break
        }
      }

      setActiveId(activeHeading)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  const buildHierarchy = (headings: DocHeading[]) => {
    const stack: Array<{ level: number; heading: DocHeading; children: any[] }> = []

    headings.forEach((heading) => {
      // Remove items from stack that are deeper or equal level
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop()
      }

      const item = { level: heading.level, heading, children: [] }

      if (stack.length > 0) {
        stack[stack.length - 1].children.push(item)
      }

      stack.push(item)
    })

    // Extract root items
    return stack.filter((item) => item.level === 2)
  }

  const renderHeadings = (items: any[], depth = 0) => {
    return (
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.heading.id}>
            <a
              href={`#${item.heading.id}`}
              className={`block px-3 py-1 text-sm rounded transition-colors ${
                activeId === item.heading.id
                  ? "text-primary font-medium bg-primary/10"
                  : "text-foreground/60 hover:text-foreground"
              }`}
              style={{ paddingLeft: `${depth * 12 + 12}px` }}
            >
              {item.heading.text}
            </a>
            {item.children.length > 0 && renderHeadings(item.children, depth + 1)}
          </li>
        ))}
      </ul>
    )
  }

  const hierarchy = buildHierarchy(headings)

  return (
    <aside className="hidden xl:block fixed right-4 top-20 w-56">
      <nav className="space-y-2">
        <h3 className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">On This Page</h3>
        {renderHeadings(hierarchy)}
      </nav>
    </aside>
  )
}
