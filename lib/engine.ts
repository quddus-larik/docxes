import { DocxesEngine } from "@/core/engine";
import { initHooks } from "@/core/hooks";
import { XMeta } from "@/x-meta.config";

export const engine = new DocxesEngine({
  mdx: XMeta.theme?.mdx,
  contentDir: XMeta.contentDir || "content/docs",
});

initHooks(engine);
