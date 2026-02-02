"use client";

import React, { useEffect } from "react";
import { XMeta } from "@/x-meta.config";

export function ThemeInjector() {
  const { theme } = XMeta;

  useEffect(() => {
    if (!theme.cssVars) return;

    const root = document.documentElement;

    // Apply root vars (radius, etc)
    if (theme.cssVars.root) {
      Object.entries(theme.cssVars.root).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }

    // We can't easily dynamically switch light/dark vars in :root vs .dark via JS efficiently 
    // without observing class changes or using a style tag. 
    // A style tag is better for performance and consistency with Tailwind classes.
    
    let styleContent = "";
    
    if (theme.cssVars.light) {
      styleContent += `:root { ${Object.entries(theme.cssVars.light).map(([k, v]) => `--${k}: ${v};`).join(" ")} }`;
    }
    
    if (theme.cssVars.dark) {
      styleContent += `.dark { ${Object.entries(theme.cssVars.dark).map(([k, v]) => `--${k}: ${v};`).join(" ")} }`;
    }

    if (styleContent) {
      const styleId = "xmeta-theme-styles";
      let styleEl = document.getElementById(styleId) as HTMLStyleElement;
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = styleContent;
    }

  }, [theme]);

  return null;
}
