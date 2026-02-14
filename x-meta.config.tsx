import { CurvedUI } from "@/marketplace/curved-ui";
import { ShadcnUI } from "@/marketplace/shadcn-ui";
import { createConfig } from "@/lib/configuration";
import { SearchDialog } from "@/components/search-dialog";

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
  searchProvider: "flexsearch",

  // DELETE SIDEBAR HEADER (OPTIONAL)
  sidebar: {
    ...ShadcnUI.sidebar,
    header: undefined, 
  }
});

export default XMeta;
