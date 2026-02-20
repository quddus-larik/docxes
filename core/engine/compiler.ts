import { createProcessor } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
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

export async function compile(content: string, options: any = {}) {
  let hast: any = null;

  const captureHast = () => (tree: any) => {
    hast = tree;
  };

  const processor = createProcessor({
    remarkPlugins: [remarkGfm, ...(options.remarkPlugins || [])],
    rehypePlugins: [
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
