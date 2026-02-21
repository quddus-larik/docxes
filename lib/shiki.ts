import { createHighlighter } from "shiki";

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

export function getShiki() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: ["javascript", "typescript", "bash", "json","c","c#","cpp","plaintext"], // preload common langs
    });
  }

  return highlighterPromise;
}