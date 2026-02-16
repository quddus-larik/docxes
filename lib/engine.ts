import { DocxesEngine } from "@/core/engine";
import { XMeta } from "@/x-meta.config";

export const engine = new DocxesEngine({
  mdx: XMeta.theme?.mdx,
  documentsPath: XMeta.documentsPath,
});
