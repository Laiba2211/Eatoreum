/**
 * Production only: inlines emitted <link rel="stylesheet"> assets into index.html as <style>.
 * Removes the extra network request Lighthouse flags as render-blocking for the main CSS bundle.
 */
import { readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

export function inlineHtmlCss() {
  /** @type {string} */
  let outDir = "";

  return {
    name: "inline-html-css",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    async closeBundle() {
      const htmlPath = join(outDir, "index.html");
      let html;
      try {
        html = await readFile(htmlPath, "utf-8");
      } catch {
        return;
      }

      const tagPattern = /<link\s+[^>]*rel=["']stylesheet["'][^>]*>/gi;
      const allTags = html.match(tagPattern) ?? [];
      if (!allTags.length) return;

      /** @type {{ tag: string; filePath: string; css: string }[]} */
      const inlined = [];

      for (const tag of allTags) {
        const hrefMatch = tag.match(/\bhref=["']([^"']+)["']/i);
        if (!hrefMatch) continue;
        const relPath = hrefMatch[1].replace(/^\//, "").replace(/^\.\//, "");
        const filePath = join(outDir, relPath);
        try {
          const css = await readFile(filePath, "utf-8");
          inlined.push({ tag, filePath, css });
        } catch {
          /* external URL or missing file */
        }
      }

      if (!inlined.length) return;

      let newHtml = html;
      for (const { tag } of inlined) {
        newHtml = newHtml.replace(tag, "");
      }

      const blob = inlined.map((x) => x.css).join("\n");
      newHtml = newHtml.replace(/<\/head>/i, `<style>${blob}</style>\n</head>`);

      await writeFile(htmlPath, newHtml, "utf-8");

      for (const { filePath } of inlined) {
        try {
          await unlink(filePath);
        } catch {
          /* ignore */
        }
      }
    },
  };
}
