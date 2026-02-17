import { serialize } from "next-mdx-remote/serialize";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";

export async function compile(content: string, options: any = {}) {
  const mdxOptions = options.mdx || {};
  const theme = mdxOptions.theme || "github-dark";
  const keepBackground = mdxOptions.keepBackground !== undefined ? mdxOptions.keepBackground : true;

  // get mdx code and saperate codes and highlight
  try {
    const mdxSource = await serialize(content, {
      mdxOptions: {
        remarkPlugins: options.remarkPlugins || [],
        rehypePlugins: [
          rehypeSlug,
          [rehypePrettyCode, { theme, keepBackground }],
          ...(options.rehypePlugins || []),
        ],
        format: "mdx",
      },
      parseFrontmatter: false, 
    });

    return mdxSource;
  } catch (e: any) {
    let errorMessage = `MDX compilation failed: ${e.message}`;
    if (e.position && e.position.start) {
      errorMessage += ` at line ${e.position.start.line}, column ${e.position.start.column}`;
    } else if (e.line && e.column) {
      errorMessage += ` at line ${e.line}, column ${e.column}`;
    }
    // Re-throw an enhanced error for the calling context (DocxesEngine.process)
    throw new Error(errorMessage, { cause: e });
  }
}
