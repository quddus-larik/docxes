import type { MetadataRoute } from "next"
import { getVersions, getAllDocs } from "@/lib/docs"
import { XMeta } from "@/x-meta.config"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: XMeta.siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${XMeta.siteUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ]

  const versions = await getVersions()

  for (const version of versions) {
    // Add version index
    entries.push({
      url: `${XMeta.siteUrl}/docs/${version}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    })

    // Add all docs for this version
    const docs = await getAllDocs(version)
    for (const doc of docs) {
      entries.push({
        url: `${XMeta.siteUrl}/docs/${version}/${doc.slug.join("/")}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      })
    }
  }

  return entries
}
