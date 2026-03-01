import React from "react";
import { createConfig } from "@/core/configuration";
import { useFramework } from "@/core/framework";
import { SearchDialog } from "@/components/search-dialog";
import { ModeToggle } from "@/components/mode-toggle";
import { mdxComponents } from "./components/mdx/mdx-components";

/**
 * 🛠️ DOCXES CONFIGURATION
 * This file is your primary control center. You define your UI logic here.
 * It's designed to be "code-first" - you write actual React components
 * to define how your documentation looks and feels.
 */

export const XMeta = createConfig({
  versions: {
    default: "latest",
    allowVersions: true
  },
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
      components: mdxComponents,
      highlighter: "rehype-pretty-code",
      highlighterTheme: {
        dark: "one-dark-pro",
        light: "github-light",
      },
      keepBackground: false,
      showLineNumbers: true,
    },
    
    header: (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
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
        <aside className="w-64 border-r sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto bg-background hidden lg:block scrollbar-none hover:scrollbar-thin transition-all">
          <div className="p-4 flex flex-col gap-2 pb-10">{children}</div>
        </aside>
      ),
      Item: ({ item, href, isActive }) => {
        const { Link } = useFramework();
        return (
          <Link
            href={href || "#"}
            className={`px-3 py-2 rounded-md text-sm transition-all duration-200 block font-medium ${
              isActive 
                ? "bg-primary/15 text-primary border-l-2 border-primary pl-2.5" 
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground pl-3"
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
        <aside className="w-64 hidden xl:block sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-8 px-6 scrollbar-none hover:scrollbar-thin transition-all">
          <h4 className="text-sm font-bold mb-4 uppercase tracking-widest text-muted-foreground/50">On This Page</h4>
          <div className="flex flex-col gap-0.5 pb-10">{children}</div>
        </aside>
      ),
      Item: ({ item, isActive }) => (
        <a
          href={`#${item.id}`}
          className={`text-xs transition-all duration-200 py-2 px-3 rounded-md block ${
            isActive 
              ? "text-primary font-semibold bg-primary/10 border-l-2 border-primary pl-2.5" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          {item.text}
        </a>
      ),
    },
  },
});

export default XMeta;
