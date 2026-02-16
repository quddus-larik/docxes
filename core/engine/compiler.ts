import { serialize } from "next-mdx-remote/serialize";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";

export async function compile(content: string, options: any = {}) {
  const mdxOptions = options.mdx || {};
  const theme = mdxOptions.theme || "github-dark";
  const keepBackground = mdxOptions.keepBackground !== undefined ? mdxOptions.keepBackground : true;

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
    parseFrontmatter: false, // We handle it in parser.ts
  });

  return mdxSource;
}
