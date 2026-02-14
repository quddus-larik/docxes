# DocXes

**The "Zero-Core" Documentation Framework for Next.js**

DocXes is a high-performance, developer-first documentation framework built with Next.js (App Router). Unlike traditional documentation tools that lock you into a proprietary core package, DocXes is a **scaffold-first** framework. You clone it, you own it, and you customize it without boundaries.

<p align="center">
 <a href="https://github.com/quddus-larik/docxility/stargazers">
  <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/quddus-larik/docxility?style=for-the-badge&color=orange" />
 </a>
 <a href="https://github.com/quddus-larik/docxility/blob/master/LICENSE">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-black.svg?style=for-the-badge&color=000000">
 </a>
</p>

---

## ✨ Key Features

- **🚀 Zero-Core Philosophy:** No hidden npm packages. The logic lives in your repository, giving you 100% control and zero dependency bloat.
- **📁 File-Based Routing:** Just drop `.mdx` or `.md` files into the `content/docs` folder. Hierarchy and navigation are generated automatically.
- **🎨 UI Marketplace:** Switch between pre-built professional themes like `CurvedUI` or `MinimalUI` with a single line of code.
- **🧩 Headless Customization:** Every UI component (Sidebar, TOC, Pagination) is "headless"—styled with Tailwind CSS via your config file.
- **🔍 Abstract Search:** Flexible search provider logic (Local/Fuse.js) that can be extended to Algolia or typesense easily.
- **🛡️ SEO & Schema:** Built-in JSON-LD schema generation for Articles and Breadcrumbs.
- **💅 Modern Typography:** Beautifully redesigned links, code blocks, and navigation elements with full Dark Mode support.

---

## 🛠️ The "One Config" Experience

DocXes centralizes your entire site's behavior in `x-meta.config.tsx`. No more hunting through dozens of files to change a primary color or a sidebar header.

```tsx
import { CurvedUI } from "./marketplace/curved-ui";

export const XMeta = createConfig({
  ...CurvedUI, // 1. Apply a marketplace theme
  
  siteName: "DocXes",
  siteUrl: "https://your-docs.com",

  // 2. Override specific UI elements with Arrow Functions
  sidebar: {
    header: ({ version }) => (
      <div className="p-6">
        <h1 className="text-xl font-bold">My Project v{version}</h1>
      </div>
    ),
  },

  // 3. Deep-theme CSS variables directly
  theme: {
    cssVars: {
      light: { "primary": "oklch(0.6 0.25 260)" },
      dark: { "primary": "oklch(0.7 0.2 260)" }
    }
  }
});
```

---

## 🚦 Customization Guardrails

To ensure your documentation remains maintainable and upgradable, DocXes follows a strict "Safe to Edit" philosophy:

- **✅ Safe to Edit:** `x-meta.config.tsx`, `content/docs/`, `marketplace/`, and `public/`.
- **⚠️ Core Logic (Avoid Editing):** `app/`, `lib/`, and `hooks/`. These contain the engine that powers the documentation.

---

## 🚀 Getting Started

1. **Clone the Repo:**
   ```bash
   git clone https://github.com/quddus-larik/docxes
   .git
   ```
2. **Install Dependencies:**
   ```bash
   pnpm install
   ```
3. **Start Developing:**
   ```bash
   pnpm dev
   ```
4. **Write Docs:**
   Add your content to `content/docs/v1/` and watch it appear instantly.

---

Built with ❤️ by [Lixril](https://lixril.vercel.app).
