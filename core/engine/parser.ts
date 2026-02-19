import matter from "gray-matter";
import { remark } from "remark";
import { Frontmatter } from "./types";

export interface ParsedMDX {
  content: string;
  frontmatter: Frontmatter;
  ast: any;
}

export async function parse(source: string): Promise<ParsedMDX> {
  const { content, data } = matter(source);
  const ast = remark().parse(content);
  return {
    content,
    frontmatter: data as Frontmatter,
    ast,
  };
}
