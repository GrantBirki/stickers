import { defineConfig, loadEnv } from "vite";
import type { Plugin } from "vite";
import { resolve } from "node:path";
import fs from "node:fs";
import { svelte } from "@sveltejs/vite-plugin-svelte";

interface StickerInput {
  id?: unknown;
}

// Prevent Vite's built-in HTML env replacement from warning when these are unset.
// When empty, we fall back to relative OG/canonical URLs in the built HTML.
process.env.VITE_SITE_URL = process.env.VITE_SITE_URL || "";
process.env.VITE_BASE = process.env.VITE_BASE || "/";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {

  const projectRoot = process.cwd();
  const generatedPagesRoot = resolve(projectRoot, ".generated-pages");
  const viteRoot = command === "build" ? generatedPagesRoot : projectRoot;

  const venv = loadEnv(mode, projectRoot, "");
  const env: Record<string, string> = Object.fromEntries(
    Object.entries(venv).filter(([key]) => key.startsWith("VITE_")),
  );

  // Always provide a base so `%VITE_BASE%` never becomes "undefined" in HTML.
  const base = env.VITE_BASE || "/";
  env.VITE_BASE = base;
  // Optional. When missing we fall back to relative OG/canonical URLs.
  env.VITE_SITE_URL = env.VITE_SITE_URL || "";
  const htmlPlugin = (): Plugin => {
    return {
      name: "html-transform",
      transformIndexHtml(html: string) {
        return html.replace(/%(.*?)%/g, (_match, key: string) => {
          // Avoid emitting the string "undefined" when an env var isn't set.
          // Returning "" keeps tags valid (relative URLs) for local/dev builds.
          const value = env[key];
          return value === undefined ? "" : value;
        });
      },
    };
  };

  const stickerInputs = (entryRoot: string): Record<string, string> => {
    try {
      const raw = fs.readFileSync(resolve(projectRoot, "public/data/stickers.json"), "utf8");
      const list = JSON.parse(raw) as StickerInput[];
      const used = new Set<string>();
      const inputs: Record<string, string> = {};
      for (const item of list) {
        const id = item?.id ?? "";
        const base = id.toString().replace(/^stickers-/, "").replace(/-\d+$/, "");
        const full = id.toString().replace(/^stickers-/, "");
        const slug = base && !used.has(base) ? base : full;
        if (!slug) continue;
        used.add(slug);
        inputs[`stickers-${slug}`] = resolve(entryRoot, "stickers", slug, "index.html");
      }
      return inputs;
    } catch {
      return {};
    }
  };

  return {
    root: viteRoot,
    publicDir: resolve(projectRoot, "public"),
    base,
    plugins: [svelte(), htmlPlugin()],
    build: {
      outDir: resolve(projectRoot, "dist"),
      // outDir is outside `root` when `root` points at `.generated-pages` during
      // production builds, so enable explicit cleanup to avoid stale artifacts.
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(generatedPagesRoot, "index.html"),
          examples: resolve(generatedPagesRoot, "examples/index.html"),
          example: resolve(generatedPagesRoot, "example/index.html"),
          work: resolve(generatedPagesRoot, "work/index.html"),
          about: resolve(generatedPagesRoot, "about/index.html"),
          services: resolve(generatedPagesRoot, "services/index.html"),
          contact: resolve(generatedPagesRoot, "contact/index.html"),
          privacy: resolve(generatedPagesRoot, "privacy/index.html"),
          terms: resolve(generatedPagesRoot, "terms/index.html"),
          ...stickerInputs(generatedPagesRoot),
        },
      }
    },
    server: {
      watch: {
        usePolling: false
      },
    },
  };
});
