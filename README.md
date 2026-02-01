# Docxes
A powerful, package-free documentation framework for NextJS (App Router) that empowers developers with simplicity, flexibility, and complete control over Documentation.

<center>
 <a href="https://github.com/quddus-larik/docxility/stargazers">
  <img
    alt="GitHub Repo stars"
    src="https://img.shields.io/github/stars/quddus-larik/docxility?style=flat-square&color=orange"
  />
</a>
  <a href="https://github.com/quddus-larik/docxility/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/badge/License-MIT-black.svg?style=flat-square"></a>
</center>

## Features

1. SEO friendly
2. File based routing for `mdx`
3. Centralized configuration file `x-meta.config.ts`
4. Auto generation of sidebar content

> [!IMPORTANT]
> It have zero core Packages of Framework (Doxility).

## One Config Control Entire Documents

```ts
export const XMeta = {
    siteName: "Docxes - lixril",
    description: "Comprehensive documentation for DocX - A dynamic documentation generator framework built with Next.js",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://docxes.vercel.app",
    documentsPath: "content/docs",
    theme: {
        provider: [],
        colorScheme: []
    },
    searchProvider: "<void>",
    interface: {
        components: {
            button: GButton,
            pagination: DocPagination,
            TOC: DocTOC,
            sidebar: DocSidebar,
        }
    }
}
```
