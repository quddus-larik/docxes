import { compile as mdxCompile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";

export interface CompileOptions {
  mdx?: {
    highlighter?: string;
    theme?: string | { light?: string; dark?: string };
    themes?: { light?: string; dark?: string };
    keepBackground?: boolean;
  };
  highlightCode?: boolean;
  remarkPlugins?: any[];
  rehypePlugins?: any[];
}

export async function compile(content: string, options: CompileOptions = {}) {
  const mdxConfig = options.mdx || {};
  // Check if highlighting should be enabled
  const shouldHighlight = options.highlightCode !== false && mdxConfig.highlighter !== "none";

  const remarkPlugins = [
    remarkGfm,
    ...(options.remarkPlugins || [])
  ];

  const rehypePlugins: any[] = [
    rehypeSlug,
    ...(options.rehypePlugins || [])
  ];

  if (shouldHighlight) {
    // Default to GitHub themes if not specified
    const theme = mdxConfig.themes || mdxConfig.theme || {
      light: "github-light",
      dark: "github-dark",
    };
    
    rehypePlugins.push([rehypePrettyCode, {
      theme: theme,
      keepBackground: mdxConfig.keepBackground ?? false, // Authentically use theme backgrounds
      grid: false,
    }]);
  }

  try {
    const result = await mdxCompile(content, {
      remarkPlugins,
      rehypePlugins,
      outputFormat: 'function-body',
      development: false, // Ensure consistent output to avoid _jsxDEV mismatch
    });

    return String(result);
  } catch (err: any) {
    console.error("[DocxesCompiler] MDX Compilation Error:", err);
    throw err;
  }
}
