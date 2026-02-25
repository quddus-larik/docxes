import React from "react";
import { createConfig } from "@/lib/configuration";
import { useFramework } from "@/core/framework";
import { SearchDialog } from "@/components/search-dialog";
import { ModeToggle } from "@/components/mode-toggle";

/**
 * 🛠️ DOCXES CONFIGURATION
 * This file is your primary control center. You define your UI logic here.
 * It's designed to be "code-first" - you write actual React components
 * to define how your documentation looks and feels.
 */

export const XMeta = createConfig({
  framework: "nextjs",
  siteName: "DocXes",
  description: "Advanced dynamic documentation engine with effortless UI control.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000/",
  contentDir: "content/docs",
  search: {
    enabled: true,
  },
  theme: {
    mdx: {
      highlighter: "rehype-pretty-code",
      highlighterTheme: {
        dark: "one-dark-pro",
        light: "github-light",
      },
      keepBackground: false,
      showLineNumbers: true,
    },
    
    header: (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4 mx-auto">
          <div className="flex items-center gap-4">
            <span className="font-bold text-lg tracking-tight">DocXes</span>
          </div>
          <div className="flex items-center gap-3">
            <SearchDialog />
            <ModeToggle />
          </div>
        </div>
      </header>
    ),

    docsViewer: ({ sidebar, content, toc, pagination }) => (
      <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
        {sidebar}
        <main className="flex-1 min-w-0">
          <div className="flex items-start">
            <div className="flex-1 px-4 py-8 lg:px-10 lg:py-12 min-w-0 max-w-4xl mx-auto">
              {content}
              <div className="mt-16">{pagination}</div>
            </div>
            {toc}
          </div>
        </main>
      </div>
    ),

    sidebar: {
      Container: ({ children }) => (
        <aside className="w-64 border-r h-screen sticky top-0 overflow-y-auto bg-background hidden lg:block">
          <div className="p-4 flex flex-col gap-2">{children}</div>
        </aside>
      ),
      Item: ({ item, href, isActive }) => {
        const { Link } = useFramework();
        return (
          <Link
            href={href || "#"}
            className={`px-3 py-1.5 rounded-md text-sm transition-all duration-200 block ${
              isActive 
                ? "bg-primary/10 text-primary font-medium border-l-2 border-primary pl-4" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground pl-3"
            }`}
          >
            {item.title}
          </Link>
        );
      },
      Group: ({ item, children, isOpen, onToggle }) => (
        <div className="flex flex-col mb-2">
          <button
            onClick={onToggle}
            className="flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/70 hover:text-foreground transition-colors text-left"
          >
            {item.title}
            <span className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </button>
          {isOpen && <div className="ml-2 pl-2 border-l border-border/50 flex flex-col gap-1 mt-1">{children}</div>}
        </div>
      ),
    },

    toc: {
      Container: ({ children }) => (
        <aside className="w-64 hidden xl:block h-screen sticky top-0 overflow-y-auto py-8 px-6">
          <h4 className="text-sm font-bold mb-4 uppercase tracking-widest text-muted-foreground/50">On This Page</h4>
          <div className="flex flex-col gap-1.5">{children}</div>
        </aside>
      ),
      Item: ({ item, isActive }) => (
        <div
          className={`text-xs transition-colors cursor-pointer py-1 ${
            isActive 
              ? "text-primary font-semibold translate-x-1" 
              : "text-muted-foreground hover:text-foreground"
          }`}
          style={{ paddingLeft: `${(item.depth - 2) * 12}px` }}
        >
          {item.text}
        </div>
      ),
    },
  },
});

export default XMeta;
