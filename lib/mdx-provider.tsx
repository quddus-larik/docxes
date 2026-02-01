import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { XMeta } from "@/x-meta.config";

interface AppMDXProviderProps {
  source: string;
}

type HighlighterName = "pretty-code" | "none";

const highlighter = (XMeta.theme.mdx.highlighter ??
  "pretty-code") as HighlighterName;

// Build mdxOptions flexibly from config
const mdxOptions =
  highlighter === "pretty-code"
    ? {
        rehypePlugins: [
          [
            rehypePrettyCode,
            {
              theme:
                XMeta.theme.mdx.theme ?? "github-light",
              keepBackground:
                XMeta.theme.mdx.keepBackground ?? true,
              
            },
          ],
        ],
      }
    : {
        // no highlighter: still return an object for options
      };

export function AppMDXProvider({ source }: AppMDXProviderProps) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions 
      } as any}
    />
  );
}
