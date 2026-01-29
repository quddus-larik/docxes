"use client";

import type { DocHeading } from "@/types/types";
import { useDocTOC } from "@/hooks/useTOC";
import { TocItem } from "@/hooks/useTOC";

interface DocTOCProps {
  headings: DocHeading[];
}

export function DocTOC({ headings }: DocTOCProps) {
  const { activeId, hierarchy, scrollToHeading } = useDocTOC(headings);

  if (!headings.length) return null;

  const renderItems = (items: TocItem[], depth = 0) => (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.heading.id}>
          <button
            type="button"
            onClick={() => scrollToHeading(item.heading.id)}
            className={`block w-full rounded px-3 py-1 text-left text-sm transition-colors ${
              activeId === item.heading.id
                ? "bg-primary/10 text-primary font-bold"
                : "text-foreground/60 hover:text-foreground"
            }`}
            style={{ paddingLeft: `${depth * 12 + 12}px` }}
          >
            {item.heading.text}
          </button>
          {item.children.length > 0 && renderItems(item.children, depth + 1)}
        </li>
      ))}
    </ul>
  );

  return (
    <aside className="fixed right-4 top-20 hidden w-56 xl:block">
      <nav className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/60">On This Page</h3>
        {renderItems(hierarchy)}
      </nav>
    </aside>
  );
}
