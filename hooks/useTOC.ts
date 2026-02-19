"use client";

import { useEffect, useState, useRef } from "react";
import type { DocHeading } from "@/core/engine";


export interface TocItem {
  heading: DocHeading;
  level: number;
  children: TocItem[];
}

export function useDocTOC(headings: DocHeading[]) {
  const [activeId, setActiveId] = useState("");
  const observer = useRef<IntersectionObserver | null>(null);
  const visibleHeadings = useRef<Map<string, boolean>>(new Map());

  useEffect(() => {
    const handleIntersections = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        visibleHeadings.current.set(entry.target.id, entry.isIntersecting);
      });

      // Find the first visible heading from the top
      const firstVisible = headings.find((h) => visibleHeadings.current.get(h.id));
      if (firstVisible) {
        setActiveId(firstVisible.id);
      }
    };

    observer.current = new IntersectionObserver(handleIntersections, {
      rootMargin: "-80px 0% -80% 0%",
      threshold: 0,
    });

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.current?.observe(el);
    });

    return () => {
      observer.current?.disconnect();
      visibleHeadings.current.clear();
    };
  }, [headings]);

  // Build nested hierarchy
  const buildHierarchy = (headings: DocHeading[]) => {
    const roots: TocItem[] = [];
    const stack: TocItem[] = [];

    for (const heading of headings) {
      const item: TocItem = { heading, level: heading.level, children: [] };
      while (stack.length && stack[stack.length - 1].level >= heading.level) stack.pop();
      if (stack.length === 0) roots.push(item);
      else stack[stack.length - 1].children.push(item);
      stack.push(item);
    }

    return roots;
  };

  const hierarchy = buildHierarchy(headings);

  // Scroll function
  const scrollToHeading = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    window.scrollTo({
      top: target.offsetTop - 80,
      behavior: "smooth",
    });
  };

  return { activeId, hierarchy, scrollToHeading };
}
