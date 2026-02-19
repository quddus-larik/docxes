import { compile as xdmCompile } from "xdm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";

export async function compile(content: string, options: any = {}) {
  const mdxOptions = options.mdx || {};
  const theme = mdxOptions.theme || "github-dark";
  const keepBackground = mdxOptions.keepBackground !== undefined ? mdxOptions.keepBackground : true;

  try {
    const compiled = await xdmCompile(content, {
      remarkPlugins: options.remarkPlugins || [],
      rehypePlugins: [
        rehypeSlug,
        [rehypePrettyCode, { theme, keepBackground }],
        ...(options.rehypePlugins || []),
      ],
      outputFormat: "function-body",
      useDynamicImport: false,
      jsxRuntime: "automatic",
      development: false,
    });

    return String(compiled);
  } catch (e: any) {
    let errorMessage = `MDX compilation failed: ${e.message}`;
    if (e.position && e.position.start) {
      errorMessage += ` at line ${e.position.start.line}, column ${e.position.start.column}`;
    } else if (e.line && e.column) {
      errorMessage += ` at line ${e.line}, column ${e.column}`;
    }
    throw new Error(errorMessage, { cause: e });
  }
}
