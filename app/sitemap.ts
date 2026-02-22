import type { MetadataRoute } from "next"
import { engine } from "@/lib/engine"
import { XMeta } from "@/x-meta.config"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = XMeta.sitemap?.siteUrl || XMeta.siteUrl;
  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ]

  const versions = await engine.getVersions()

  for (const version of versions) {
    // Add version index
    entries.push({
      url: `${siteUrl}/docs/${version}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    })

    // Add all docs for this version
    const docs = await engine.getAllDocs(version)
    for (const doc of docs) {
      entries.push({
        url: `${siteUrl}/docs/${version}/${doc.slug.join("/")}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      })
    }
  }

  return entries
}
