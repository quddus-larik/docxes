import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import type { Metadata } from "next"
import { XMeta } from "@/x-meta.config"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Home",
  description: XMeta.description,
  keywords: ["documentation", "guide", "NextJS", "framework", "DocX"],
  openGraph: {
    title: `${XMeta.siteName} - Home`,
    description: XMeta.description,
    url: XMeta.siteUrl,
    type: "website",
    siteName: XMeta.siteName,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${XMeta.siteName} - Home`,
    description: XMeta.description,
  },
  alternates: {
    canonical: XMeta.siteUrl,
  },
}

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight">Docxes</h1>
        <p className="text-xl text-muted-foreground">
         A Documentation System Framework for NextJS  that uses Tailwindcss, Shadcn UI and Typescript
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/docs/v1/introduction">
            <Button size="lg" className="gap-2">
              View Documentation
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
          <a href="https://github.com/quddus-larik/docxes" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline">
              View on GitHub
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">File-based</h3>
            <p className="text-sm text-muted-foreground">Documentation lives in your codebase</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Auto-generated</h3>
            <p className="text-sm text-muted-foreground">Navigation built from folder structure</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Versioned</h3>
            <p className="text-sm text-muted-foreground">Support for multiple doc versions</p>
          </div>
        </div>
      </div>
    </main>
  )
}
