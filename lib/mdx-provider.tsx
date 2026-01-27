import { MDXRemote } from "next-mdx-remote/rsc"
import { mdxComponents } from "@/components/mdx-components"

interface AppMDXProviderProps {
  source: string
}

export function AppMDXProvider({ source }: AppMDXProviderProps) {
  // no hooks used here
  return <MDXRemote source={source} components={mdxComponents} />
}
