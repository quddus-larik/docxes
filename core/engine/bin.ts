#!/usr/bin/env node
import { DocxesEngine } from "./engine";
import { XMeta } from "../../x-meta.config";

async function main() {
  const engine = new DocxesEngine({
    mdx: XMeta.theme?.mdx,
    documentsPath: XMeta.documentsPath,
    sitemap: {
      enabled: XMeta.sitemap?.enabled,
      siteUrl: XMeta.sitemap?.siteUrl || XMeta.siteUrl,
    },
  });

  const command = process.argv[2];

  switch (command) {
    case "build":
      await engine.build();
      break;
    case "clean":
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const cacheDir = path.resolve(process.cwd(), ".docxes");
      try {
        await fs.rm(cacheDir, { recursive: true, force: true });
        console.log("[DocxesEngine] Cache cleaned.");
      } catch (e) {
        console.error("[DocxesEngine] Failed to clean cache:", e);
      }
      break;
    default:
      console.log("Usage: docxes [build|clean]");
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
