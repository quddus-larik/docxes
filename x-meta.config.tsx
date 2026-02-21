import { ShadcnUI } from "@/marketplace/shadcn-ui";
import { createConfig } from "@/lib/configuration";
import { Header } from "./components/header";

/**
 * 💡 TIP FOR DEVELOPERS:
 * This file is your primary control center. You should mostly edit this file
 * and the 'content/' directory. Avoid changing files in 'lib/' or 'app/' 
 * unless you are extending the core framework logic.
 */

/**
 * 🚀 ACTIVE CONFIG
 * To switch designs, simply swap the spread theme (e.g., ...ShadcnUI, ...CurvedUI or ...MinimalUI)
 */
export const XMeta = createConfig({
  ...ShadcnUI, // <-- ACTIVE THEME: SHADCN UI (B/W)
  siteName: "DocXes",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://docxes.vercel.app",
  search: {
    enabled: true,
  },
  theme:{
    mdx:{
      highlighter: "rehype-pretty-code",
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      keepBackground: false
    }
  },
  sidebar: {
    ...ShadcnUI.sidebar,
  },
  header: Header
});

export default XMeta;
