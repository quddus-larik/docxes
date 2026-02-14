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
    
    // Default values if not provided
    const defaultLight = {
      "primary": "oklch(0.21 0.006 285.885)",
      "secondary": "oklch(0.70 0.19 338)",
    };
    const defaultDark = {
      "primary": "oklch(0.92 0.004 286.32)",
      "secondary": "oklch(0.70 0.19 338)",
    };

    const lightVars = { ...defaultLight, ...theme.cssVars?.light };
    const darkVars = { ...defaultDark, ...theme.cssVars?.dark };
    
    styleContent += `:root { ${Object.entries(lightVars).map(([k, v]) => `--${k}: ${v};`).join(" ")} }`;
    styleContent += `.dark { ${Object.entries(darkVars).map(([k, v]) => `--${k}: ${v};`).join(" ")} }`;

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
