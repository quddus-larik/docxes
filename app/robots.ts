import type { MetadataRoute } from "next"
import { XMeta } from "@/x-meta.config"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ["googlebot", "bingbot"],
        allow: "/",
        crawlDelay: 1,
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/.next/"],
      },
    ],
    sitemap: `${XMeta.siteUrl}/sitemap.xml`,
    host: XMeta.siteUrl,
  }
}
