import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const STICKERS_JSON = path.join(ROOT, "public", "data", "stickers.json");
const PUBLIC_ROOT = path.join(ROOT, "public");
const OG_DEFAULT_PUBLIC_PATH = "/og/default.png";
const SITE_NAME = "birki stickers";
// These placeholders are replaced by `vite.config.js`'s `html-transform` plugin.
// Keep them as plain strings in the generated HTML (don't resolve at generation time).
const SITE_URL_PLACEHOLDER = "%VITE_SITE_URL%";
const BASE_PLACEHOLDER = "%VITE_BASE%";
const OUT_ROOT = path.join(ROOT, "stickers");
const STATIC_ROUTES = [
  { dir: path.join(ROOT, "examples"), name: "examples", description: "Local card effect demos (no licensed imagery)." },
  { dir: path.join(ROOT, "example"), name: "example", description: "Local card effect demos (no licensed imagery)." },
  { dir: path.join(ROOT, "work"), name: "work", description: "Work" },
  { dir: path.join(ROOT, "about"), name: "about", description: "About" },
  { dir: path.join(ROOT, "services"), name: "services", description: "Services" },
  { dir: path.join(ROOT, "contact"), name: "contact", description: "Contact" },
  { dir: path.join(ROOT, "privacy"), name: "privacy", description: "Privacy policy" },
  { dir: path.join(ROOT, "terms"), name: "terms", description: "Terms and conditions" }
];

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

const baseSlugFromStickerId = (id) =>
  (id ?? "").toString().replace(/^stickers-/, "").replace(/-\d+$/, "");
const fullSlugFromStickerId = (id) => (id ?? "").toString().replace(/^stickers-/, "");

const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });

const escapeHtmlAttr = (v) =>
  (v ?? "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const escapeHtmlText = (v) =>
  (v ?? "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const publicPathToFsPath = (publicPath) =>
  path.join(PUBLIC_ROOT, (publicPath || "").toString().replace(/^\/+/, ""));

const pickOgImage = (candidates) => {
  for (const candidate of candidates || []) {
    if (!candidate) continue;
    if (fs.existsSync(publicPathToFsPath(candidate))) return candidate;
  }
  return OG_DEFAULT_PUBLIC_PATH;
};

const absoluteUrlForPublicPath = (publicPath) => {
  const cleaned = (publicPath || "").toString().replace(/^\/+/, "");
  return `${SITE_URL_PLACEHOLDER}${BASE_PLACEHOLDER}${cleaned}`;
};

const absoluteUrlForRoute = (routePath) => {
  const cleaned = (routePath || "").toString().replace(/^\/+/, "");
  return `${SITE_URL_PLACEHOLDER}${BASE_PLACEHOLDER}${cleaned}`;
};

const htmlForRoute = ({ name, description }) => {
  const title = `${SITE_NAME} / ${name}`;
  const routePath = `${name}/`;
  const ogImage = pickOgImage([`/og/${name}.png`, OG_DEFAULT_PUBLIC_PATH]);
  const ogImageUrl = absoluteUrlForPublicPath(ogImage);
  const canonicalUrl = absoluteUrlForRoute(routePath);
  const alt = `${SITE_NAME} preview image`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />

    <title>${escapeHtmlText(title)}</title>
    <meta name="description" content="${escapeHtmlAttr(description)}" />

    <link rel="canonical" href="${escapeHtmlAttr(canonicalUrl)}" vite-ignore />
    <meta property="og:site_name" content="${escapeHtmlAttr(SITE_NAME)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtmlAttr(title)}" />
    <meta property="og:description" content="${escapeHtmlAttr(description)}" />
    <meta property="og:url" content="${escapeHtmlAttr(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtmlAttr(ogImageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:alt" content="${escapeHtmlAttr(alt)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtmlAttr(title)}" />
    <meta name="twitter:description" content="${escapeHtmlAttr(description)}" />
    <meta name="twitter:image" content="${escapeHtmlAttr(ogImageUrl)}" />
    <meta name="twitter:image:alt" content="${escapeHtmlAttr(alt)}" />

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
};

const htmlForSlug = ({ slug, title, description }) => {
  const routePath = `stickers/${slug}/`;
  const ogImage = pickOgImage([`/og/stickers/${slug}.png`, OG_DEFAULT_PUBLIC_PATH]);
  const ogImageUrl = absoluteUrlForPublicPath(ogImage);
  const canonicalUrl = absoluteUrlForRoute(routePath);
  const alt = `${SITE_NAME} preview image`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />

    <title>${escapeHtmlText(title)}</title>
    <meta name="description" content="${escapeHtmlAttr(description)}" />

    <link rel="canonical" href="${escapeHtmlAttr(canonicalUrl)}" vite-ignore />
    <meta property="og:site_name" content="${escapeHtmlAttr(SITE_NAME)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtmlAttr(title)}" />
    <meta property="og:description" content="${escapeHtmlAttr(description)}" />
    <meta property="og:url" content="${escapeHtmlAttr(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtmlAttr(ogImageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:alt" content="${escapeHtmlAttr(alt)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtmlAttr(title)}" />
    <meta name="twitter:description" content="${escapeHtmlAttr(description)}" />
    <meta name="twitter:image" content="${escapeHtmlAttr(ogImageUrl)}" />
    <meta name="twitter:image:alt" content="${escapeHtmlAttr(alt)}" />

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
};

const main = () => {
  // These routes are pure static entrypoints for Vite multi-page builds.
  // They are intentionally generated so they don't have to be committed.
  for (const route of STATIC_ROUTES) {
    ensureDir(route.dir);
    fs.writeFileSync(path.join(route.dir, "index.html"), htmlForRoute(route), "utf8");
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
    const title = `${item?.name ? item.name : slug} | ${SITE_NAME}`;
    const description = item?.description
      ? item.description
      : "Sticker card inspect view.";
    fs.writeFileSync(
      path.join(dir, "index.html"),
      htmlForSlug({ slug, title, description }),
      "utf8"
    );
  }
};

main();
