import * as fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

export interface FileHashMap {
  [filePath: string]: string; // filePath -> SHA256 hash
}

export class FileHashTracker {
  private hashDbPath: string;
  private hashes: FileHashMap = {};

  constructor(hashDbPath: string = ".docxes/file-hashes.json") {
    this.hashDbPath = path.resolve(process.cwd(), hashDbPath);
  }

  async load(): Promise<void> {
    try {
      const content = await fs.readFile(this.hashDbPath, "utf-8");
      this.hashes = JSON.parse(content);
    } catch (e) {
      // File doesn't exist yet, start fresh
      this.hashes = {};
    }
  }

  async save(): Promise<void> {
    const dir = path.dirname(this.hashDbPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.hashDbPath, JSON.stringify(this.hashes, null, 2));
  }

  async getFileHash(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return createHash("sha256").update(content).digest("hex");
    } catch (e) {
      return "";
    }
  }

  hasChanged(filePath: string, currentHash: string): boolean {
    const storedHash = this.hashes[filePath];
    return !storedHash || storedHash !== currentHash;
  }

  updateHash(filePath: string, hash: string): void {
    this.hashes[filePath] = hash;
  }

  removeHash(filePath: string): void {
    delete this.hashes[filePath];
  }

  getStoredHash(filePath: string): string | undefined {
    return this.hashes[filePath];
  }
}
