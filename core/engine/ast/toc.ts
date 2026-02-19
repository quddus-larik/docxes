import { remark } from "remark";
import { visit } from "unist-util-visit";
import { TOCItem } from "../types";

export async function generateTOC(content: string): Promise<TOCItem[]> {
  const toc: TOCItem[] = [];
  
  const processor = remark().use(() => (tree: any) => {
    visit(tree, "heading", (node: any) => {
      const text = node.children
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.value)
        .join("");
        
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      toc.push({
        id,
        title: text,
        depth: node.depth,
      });
    });
  });

  await processor.process(content);
  return toc;
}
