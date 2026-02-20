import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { XMeta } from "@/x-meta.config"
import { Providers } from "@/components/providers"
import { ThemeInjector } from "@/components/theme-injector"
import { engine } from "@/lib/engine"
import "./globals.css"
import { Suspense } from "react"
import { Google_Sans_Code } from "next/font/google"


export const metadata: Metadata = {
  title: {
    default: XMeta.siteName,
    template: `%s | ${XMeta.siteName}`,
  },
  description: XMeta.description,
  keywords: ["documentation", "guide", "NextJS", "framework","documentation-tool"],
  authors: [{ name: "Quddus", url: "https://docxes.vercel.app" }],
  creator: "Quddus",
  publisher: "LIXRIL",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  metadataBase: new URL(XMeta.siteUrl),
  alternates: {
    canonical: XMeta.siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: XMeta.siteName,
  description: XMeta.description,
  url: XMeta.siteUrl,
  logo: `${XMeta.siteUrl}/icon.svg`,
  author: {
    "@type": "Person",
    name: "Quddus",
    url: "https://lixril.vercel.app",
  },
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: XMeta.siteName,
  description: XMeta.description,
  url: XMeta.siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${XMeta.siteUrl}/docs?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const versions = await engine.getVersions();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body className={`font-google antialiased`}>
        <Providers attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ThemeInjector />
          <div className="relative flex min-h-svh flex-col">
            {XMeta.header && (
              <XMeta.header 
                siteName={XMeta.siteName} 
                versions={versions} 
              />
            )}
            <main className="flex-1 flex flex-col">
              <Suspense fallback={<div>Loading...</div>}>
                {children}
              </Suspense>
            </main>
          </div>
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
