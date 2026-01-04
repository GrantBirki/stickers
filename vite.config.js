import { defineConfig, loadEnv } from 'vite'
import { resolve } from "path";
import fs from "node:fs";
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Prevent Vite's built-in HTML env replacement from warning when these are unset.
// When empty, we fall back to relative OG/canonical URLs in the built HTML.
process.env.VITE_SITE_URL = process.env.VITE_SITE_URL || "";
process.env.VITE_BASE = process.env.VITE_BASE || "/";

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {

  const venv = loadEnv(mode, process.cwd(), '')
  const env = Object.keys(venv)
    .filter((item) => item.startsWith("VITE_"))
    .reduce((cur, key) => {
      return Object.assign(cur, { [key]: venv[key] });
    }, {});

  // Always provide a base so `%VITE_BASE%` never becomes "undefined" in HTML.
  const base = env.VITE_BASE || "/";
  env.VITE_BASE = base;
  // Optional. When missing we fall back to relative OG/canonical URLs.
  env.VITE_SITE_URL = env.VITE_SITE_URL || "";

  const htmlPlugin = () => {
    return {
      name: "html-transform",
      transformIndexHtml(html) {
        return html.replace(/%(.*?)%/g, function (match, p1) {
          // Avoid emitting the string "undefined" when an env var isn't set.
          // Returning "" keeps tags valid (relative URLs) for local/dev builds.
          const value = env[p1];
          return value === undefined ? "" : value;
        });
      },
    };
  };

  const stickerInputs = () => {
    try {
      const raw = fs.readFileSync(resolve(process.cwd(), "public/data/stickers.json"), "utf8");
      const list = JSON.parse(raw) || [];
      const used = new Set();
      const inputs = {};
      for (const item of list) {
        const id = item?.id ?? "";
        const base = id.toString().replace(/^stickers-/, "").replace(/-\\d+$/, "");
        const full = id.toString().replace(/^stickers-/, "");
        const slug = base && !used.has(base) ? base : full;
        if (!slug) continue;
        used.add(slug);
        inputs[`stickers-${slug}`] = resolve(process.cwd(), "stickers", slug, "index.html");
      }
      return inputs;
    } catch {
      return {};
    }
  };

  return {
    base,
    plugins: [svelte(), htmlPlugin()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(process.cwd(), "index.html"),
          examples: resolve(process.cwd(), "examples/index.html"),
          example: resolve(process.cwd(), "example/index.html"),
          work: resolve(process.cwd(), "work/index.html"),
          about: resolve(process.cwd(), "about/index.html"),
          services: resolve(process.cwd(), "services/index.html"),
          contact: resolve(process.cwd(), "contact/index.html"),
          privacy: resolve(process.cwd(), "privacy/index.html"),
          terms: resolve(process.cwd(), "terms/index.html"),
          ...stickerInputs()
        }
      }
    },
    server: {
      watch: {
        usePolling: false
      }
    }
  }
});
