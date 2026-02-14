"use client";

import { useEffect, useState, useRef } from "react";
import type { DocHeading } from "@/types/types";


export interface TocItem {
  heading: DocHeading;
  level: number;
  children: TocItem[];
}

export function useDocTOC(headings: DocHeading[]) {
  const [activeId, setActiveId] = useState("");
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleIntersections = (entries: IntersectionObserverEntry[]) => {
      // Find the first entry that is intersecting
      const visibleEntry = entries.find((entry) => entry.isIntersecting);
      if (visibleEntry) {
        setActiveId(visibleEntry.target.id);
      }
    };

    observer.current = new IntersectionObserver(handleIntersections, {
      rootMargin: "-100px 0% -80% 0%",
      threshold: 1.0,
    });

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.current?.observe(el);
    });

    return () => observer.current?.disconnect();
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
