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
  const isTest = mode === "test";

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
    resolve: isTest
      ? {
          // Vitest loads modules through Vite's SSR pipeline, which can otherwise resolve
          // `import "svelte"` to the server entrypoint. Force the client runtime so
          // @testing-library/svelte can mount components in jsdom.
          alias: [
            { find: /^svelte$/, replacement: resolve(process.cwd(), "node_modules/svelte/src/index-client.js") }
          ]
        }
      : undefined,
    // Vitest runs Vite in SSR mode under the hood, so force the browser Svelte
    // entrypoints (Svelte's default export condition points to server-only APIs).
    ssr: {
      resolve: {
        conditions: ["browser"],
        // Ensure Vite's SSR module loader uses browser conditions even for externalized deps.
        externalConditions: ["browser"]
      }
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./test/setup.js"],
      // Ensure Node resolves Svelte's browser entrypoints (otherwise `import { mount } from "svelte"`
      // resolves to the server build which throws at runtime).
      pool: "forks",
      execArgv: ["--conditions", "browser", "--conditions", "svelte"],
      server: {
        deps: {
          // Ensure Vite transforms these deps so imports use the configured resolver
          // (otherwise Node resolves Svelte's default export to the server entry).
          inline: ["svelte", "@testing-library/svelte", "@testing-library/svelte-core"]
        }
      },
      restoreMocks: true,
      clearMocks: true,
      mockReset: true,
      coverage: {
        provider: "v8",
        reporter: ["text"],
        include: ["src/**/*.{js,svelte}"],
        exclude: ["src/vite-env.d.ts"],
        thresholds: {
          // Current suite covers all JS modules and key UI flows (including
          // jsdom component tests). Some Svelte-compiled branches remain hard
          // to hit without a lot of brittle DOM-edge-case testing, but this
          // still enforces a high baseline and prevents regressions.
          lines: 98,
          functions: 100,
          branches: 87,
          statements: 98
        }
      }
    },
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
