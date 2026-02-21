"use client";

import React, { useState, useEffect } from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { run } from "@mdx-js/mdx";

export interface DocxesRendererProps {
  code: string; // The compiled MDX code (function body)
  components?: Record<string, any>;
}

export function DocxesRenderer({ code, components = {} }: DocxesRendererProps) {
  const [Content, setContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!code) return;
      
      // Safety check: ensure code is a string
      if (typeof code !== "string") {
        console.error("[DocxesRenderer] Expected code string but received:", typeof code);
        if (isMounted) setError("Invalid MDX code format.");
        return;
      }

      try {
        // MDX run requires Fragment, jsx, and jsxs
        const { default: MDXContent } = await run(code, {
          Fragment: jsxRuntime.Fragment,
          jsx: (jsxRuntime as any).jsx,
          jsxs: (jsxRuntime as any).jsxs,
          baseUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
        });
        
        if (isMounted) {
          setContent(() => MDXContent);
          setError(null);
        }
      } catch (err: any) {
        console.error("[DocxesRenderer] Error running MDX:", err);
        if (isMounted) {
          setError(err.message || String(err));
        }
      }
    }
    load();
    return () => { isMounted = false; };
  }, [code]);

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
        <p className="font-bold">MDX Execution Error:</p>
        <pre className="mt-2 text-xs overflow-auto whitespace-pre-wrap">{error}</pre>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
        >
          Reload Page
        </button>
      </div>
    );
  }

  if (!Content) {
    return (
      <div className="animate-pulse space-y-4 py-4">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
    ); 
  }

  return <Content components={components} />;
}
