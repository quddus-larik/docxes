"use client";

import { useEffect, useState } from "react";
import type { DocHeading } from "@/types/types";


export interface TocItem {
  heading: DocHeading;
  level: number;
  children: TocItem[];
}

export function useDocTOC(headings: DocHeading[]) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const article = document.getElementById("docs-scroll-container");
    if (!article) return;

    let container = article.parentElement;
    while (container && !container.classList.contains("overflow-auto")) {
      container = container.parentElement;
    }
    if (!container) return;

    const handleScroll = () => {
      let active = "";
      const containerRect = container.getBoundingClientRect();
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (!el) continue;
        const elRect = el.getBoundingClientRect();
        if (elRect.top - containerRect.top <= 120) active = h.id;
        else break;
      }
      setActiveId(active);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
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
    const article = document.getElementById("docs-scroll-container");
    const target = document.getElementById(id);
    if (!article || !target) return;

    let container = article.parentElement;
    while (container && !container.classList.contains("overflow-auto")) {
      container = container.parentElement;
    }
    if (!container) return;

    const targetPosition =
      target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    container.scrollTo({ top: targetPosition - 80, behavior: "smooth" });
  };

  return { activeId, hierarchy, scrollToHeading };
}
