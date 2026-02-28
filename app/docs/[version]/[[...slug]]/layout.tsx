import type React from "react";
import type { Metadata } from "next";
import { XMeta } from "@/x-meta.config";
export const metadata: Metadata = {
  title: "Documentation",
  description: "Comprehensive documentation and guides",
  keywords: ["documentation", "docs", "guide"],
  openGraph: {
    title: "Documentation",
    description: "Comprehensive documentation and guides",
    url: `${XMeta.siteUrl}/docs`,
    type: "website",
    siteName: XMeta.siteName,
  },
  twitter: {
    card: "summary",
    title: "Documentation",
    description: "Comprehensive documentation and guides",
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
