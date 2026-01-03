import { defineConfig, loadEnv } from 'vite'
import { resolve } from "path";
import fs from "node:fs";
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {

  const venv = loadEnv(mode, process.cwd(), '')
  const env = Object.keys(venv).filter((item) => item.startsWith("VITE_")).reduce((cur, key) => { return Object.assign(cur, { [key]: venv[key] })}, {}) ;
  const base = env.VITE_BASE || "/";

  const htmlPlugin = () => {
    return {
      name: "html-transform",
      transformIndexHtml(html) {
        return html.replace(/%(.*?)%/g, function (match, p1) {
          return env[p1];
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
