import type { NextConfig } from "next"
import createMDX from "@next/mdx"

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // jsxImportSource: "@emotion/react",
  },
})

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx", "md"],
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=120" }],
      },
    ]
  },
}

export default withMDX(nextConfig)
