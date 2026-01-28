import { DocPagination } from "./components/doc-pagination"
import { DocSidebar } from "./components/doc-sidebar"
import { DocTOC } from "./components/doc-toc"
import { GButton } from "./plugins/deftheme/GButton"
// Sitename

export const XMeta = {
    siteName: "DocX - lixril",
    description: "Comprehensive documentation for DocX - A dynamic documentation generator framework built with Next.js",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://docxify.vercel.com",
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