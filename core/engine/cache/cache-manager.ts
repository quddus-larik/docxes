import * as fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { DocxesOutput } from "../types";

export class CacheManager {
  private cacheDir: string;

  constructor(cacheDir: string = ".docxes") {
    this.cacheDir = path.resolve(process.cwd(), cacheDir);
  }

  async init() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (e) {
      // Ignore
    }
  }

  async set(key: string, data: DocxesOutput) {
    await this.init();
    const filePath = path.join(this.cacheDir, `${this.hashKey(key)}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async get(key: string): Promise<DocxesOutput | null> {
    const filePath = path.join(this.cacheDir, `${this.hashKey(key)}.json`);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      return null;
    }
  }

  private hashKey(key: string): string {
    // Use SHA256 hash for reliable, collision-free file names
    return createHash("sha256").update(key).digest("hex").slice(0, 32);
  }
}
