import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const STICKERS_JSON = path.join(ROOT, "public", "data", "stickers.json");
const OUT_ROOT = path.join(ROOT, "stickers");
const EXAMPLES_ROUTES = [
  { dir: path.join(ROOT, "examples"), name: "examples" },
  { dir: path.join(ROOT, "example"), name: "example" }
];

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

const baseSlugFromStickerId = (id) =>
  (id ?? "").toString().replace(/^stickers-/, "").replace(/-\d+$/, "");
const fullSlugFromStickerId = (id) => (id ?? "").toString().replace(/^stickers-/, "");

const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });

const htmlForExamples = (name) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />

    <title>birki stickers / ${name}</title>
    <meta name="description" content="Local card effect demos (no licensed imagery)." />

    <link rel="icon" href="/favicon.png" />

    <script>
      (() => {
        try {
          const stored = localStorage.getItem("theme");
          const systemDark =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;
          const theme =
            stored === "light" || stored === "dark"
              ? stored
              : systemDark
                ? "dark"
                : "light";
          document.documentElement.dataset.theme = theme;
        } catch {
          // Ignore (e.g. privacy mode blocking storage).
        }
      })();
    </script>

    <!-- fonts (local) -->
    <link
      rel="preload"
      href="/fonts/mona-sans/MonaSansVF.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    />
    <link
      rel="preload"
      href="/fonts/mona-sans/MonaSansMonoVF.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    />

    <!-- styles -->
    <link rel="stylesheet" href="/css/global.css" />

    <link rel="stylesheet" href="/css/cards/base.css" />
    <link rel="stylesheet" href="/css/cards.css" />
    <link rel="stylesheet" href="/css/cards/basic.css" />
    <link rel="stylesheet" href="/css/cards/reverse-holo.css" />
    <link rel="stylesheet" href="/css/cards/regular-holo.css" />
    <link rel="stylesheet" href="/css/cards/cosmos-holo.css" />
    <link rel="stylesheet" href="/css/cards/amazing-rare.css" />
    <link rel="stylesheet" href="/css/cards/radiant-holo.css" />
    <link rel="stylesheet" href="/css/cards/v-regular.css" />
    <link rel="stylesheet" href="/css/cards/v-full-art.css" />
    <link rel="stylesheet" href="/css/cards/v-max.css" />
    <link rel="stylesheet" href="/css/cards/v-star.css" />
    <link rel="stylesheet" href="/css/cards/trainer-full-art.css" />
    <link rel="stylesheet" href="/css/cards/rainbow-holo.css" />
    <link rel="stylesheet" href="/css/cards/rainbow-alt.css" />
    <link rel="stylesheet" href="/css/cards/secret-rare.css" />
    <link rel="stylesheet" href="/css/cards/trainer-gallery-holo.css" />
    <link rel="stylesheet" href="/css/cards/trainer-gallery-v-regular.css" />
    <link rel="stylesheet" href="/css/cards/trainer-gallery-v-max.css" />
    <link rel="stylesheet" href="/css/cards/trainer-gallery-secret-rare.css" />
    <link rel="stylesheet" href="/css/cards/shiny-rare.css" />
    <link rel="stylesheet" href="/css/cards/shiny-v.css" />
    <link rel="stylesheet" href="/css/cards/shiny-vmax.css" />
    <link rel="stylesheet" href="/css/cards/spiral-holographic.css" />
    <link rel="stylesheet" href="/css/cards/swsh-pikachu.css" />
    <link rel="stylesheet" href="/css/cards/stickers.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;

const htmlForSlug = (slug) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />

    <title>birki stickers / ${slug}</title>
    <meta name="description" content="Sticker card inspect view." />

    <link rel="icon" href="/favicon.png" />

    <script>
      // Inspect pages are intentionally dark-only and should not mutate localStorage.
      document.documentElement.dataset.theme = "dark";
    </script>

    <!-- fonts (local) -->
    <link
      rel="preload"
      href="/fonts/mona-sans/MonaSansVF.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    />
    <link
      rel="preload"
      href="/fonts/mona-sans/MonaSansMonoVF.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    />

    <!-- styles -->
    <link rel="stylesheet" href="/css/global.css" />

    <link rel="stylesheet" href="/css/cards/base.css" />
    <link rel="stylesheet" href="/css/cards.css" />
    <link rel="stylesheet" href="/css/cards/basic.css" />
    <link rel="stylesheet" href="/css/cards/reverse-holo.css" />
    <link rel="stylesheet" href="/css/cards/regular-holo.css" />
    <link rel="stylesheet" href="/css/cards/cosmos-holo.css" />
    <link rel="stylesheet" href="/css/cards/amazing-rare.css" />
    <link rel="stylesheet" href="/css/cards/radiant-holo.css" />
    <link rel="stylesheet" href="/css/cards/v-regular.css" />
    <link rel="stylesheet" href="/css/cards/v-full-art.css" />
    <link rel="stylesheet" href="/css/cards/v-max.css" />
    <link rel="stylesheet" href="/css/cards/v-star.css" />
    <link rel="stylesheet" href="/css/cards/trainer-full-art.css" />
    <link rel="stylesheet" href="/css/cards/rainbow-holo.css" />
    <link rel="stylesheet" href="/css/cards/rainbow-alt.css" />
    <link rel="stylesheet" href="/css/cards/secret-rare.css" />
    <link rel="stylesheet" href="/css/cards/trainer-gallery-holo.css" />
    <link rel="stylesheet" href="/css/cards/trainer-gallery-v-regular.css" />
    <link rel="stylesheet" href="/css/cards/trainer-gallery-v-max.css" />
    <link rel="stylesheet" href="/css/cards/trainer-gallery-secret-rare.css" />
    <link rel="stylesheet" href="/css/cards/shiny-rare.css" />
    <link rel="stylesheet" href="/css/cards/shiny-v.css" />
    <link rel="stylesheet" href="/css/cards/shiny-vmax.css" />
    <link rel="stylesheet" href="/css/cards/spiral-holographic.css" />
    <link rel="stylesheet" href="/css/cards/swsh-pikachu.css" />
    <link rel="stylesheet" href="/css/cards/stickers.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;

const main = () => {
  // These routes are pure static entrypoints for Vite multi-page builds.
  // They are intentionally generated so they don't have to be committed.
  for (const route of EXAMPLES_ROUTES) {
    ensureDir(route.dir);
    fs.writeFileSync(path.join(route.dir, "index.html"), htmlForExamples(route.name), "utf8");
  }

  const stickers = readJson(STICKERS_JSON) || [];
  ensureDir(OUT_ROOT);

  const used = new Set();
  for (const item of stickers) {
    const base = baseSlugFromStickerId(item?.id);
    const full = fullSlugFromStickerId(item?.id);
    const slug = !base ? full : used.has(base) ? full : base;
    if (!slug) continue;
    used.add(slug);

    const dir = path.join(OUT_ROOT, slug);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, "index.html"), htmlForSlug(slug), "utf8");
  }
};

main();
