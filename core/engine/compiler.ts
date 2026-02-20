import { createProcessor } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeShiki from "@shikijs/rehype";
import { transformerFoldableLines } from "@rehype-pretty/transformers";
import { visit } from "unist-util-visit";

// ---- strip positions (keeps JSON small)
function stripPosition() {
  return (tree: any) => {
    visit(tree, (node: any) => {
      delete node.position;
      if (node.attributes) {
        node.attributes.forEach((attr: any) => delete attr.position);
      }
    });
  };
}

// ---- global highlighter cache (IMPORTANT)
let shikiConfig: any = null;

async function getShikiConfig(themes: any) {
  if (shikiConfig) return shikiConfig;

  shikiConfig = {
    themes,
    inline: "style", // 👈 critical for your renderer
    transformers: [
      transformerFoldableLines(), // enables {1,3} line highlighting
    ],
  };

  return shikiConfig;
}

export async function compile(content: string, options: any = {}) {
  const mdxOptions = options.mdx || {};
  const highlighter = mdxOptions.highlighter || "shiki";

  const themes = mdxOptions.themes || {
    light: "github-light",
    dark: "github-dark",
  };

  const shikiThemes =
    typeof themes === "string" ? { light: themes, dark: themes } : themes;

  let hast: any = null;

  const captureHast = () => (tree: any) => {
    hast = tree;
  };

  const rehypePlugins: any[] = [rehypeSlug];

  if (highlighter === "shiki" || highlighter === "pretty-code") {
    const config = await getShikiConfig(shikiThemes);

    rehypePlugins.push([rehypeShiki, config]);
  }

  const processor = createProcessor({
    remarkPlugins: [remarkGfm, ...(options.remarkPlugins || [])],
    rehypePlugins: [
      ...rehypePlugins,
      ...(options.rehypePlugins || []),
      stripPosition,
      captureHast,
    ],
  });

  await processor.process(content);

  if (!hast) {
    throw new Error("Failed to compile MDX to HAST");
  }

  return JSON.stringify(hast);
}