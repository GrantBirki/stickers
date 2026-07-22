import fs from "node:fs";
import path from "node:path";

interface StaticRoute {
  dir: string;
  name: string;
  description: string;
}

interface StickerRecord {
  id?: unknown;
  name?: string;
  description?: string;
}

interface PageMetadata {
  name: string;
  description: string;
}

interface StickerPageMetadata {
  slug: string;
  title: string;
  description: string;
}

const ROOT = process.cwd();
const STICKERS_JSON = path.join(ROOT, "public", "data", "stickers.json");
const PUBLIC_ROOT = path.join(ROOT, "public");
const GENERATED_ROOT = path.join(ROOT, ".generated-pages");
const MAIN_INDEX_SRC = path.join(ROOT, "index.html");
const MAIN_INDEX_OUT = path.join(GENERATED_ROOT, "index.html");
const GENERATED_SRC_LINK = path.join(GENERATED_ROOT, "src");
const OG_DEFAULT_PUBLIC_PATH = "/og/default.png";
const SITE_NAME = "birki stickers";
// These placeholders are replaced by `vite.config.ts`'s `html-transform` plugin.
// Keep them as plain strings in the generated HTML (don't resolve at generation time).
const SITE_URL_PLACEHOLDER = "%VITE_SITE_URL%";
const BASE_PLACEHOLDER = "%VITE_BASE%";
const CARD_CSS_BUNDLE_PUBLIC_PATH = "/css/cards/all.css";
const OUT_ROOT = path.join(GENERATED_ROOT, "stickers");
const STATIC_ROUTES: StaticRoute[] = [
  { dir: path.join(GENERATED_ROOT, "examples"), name: "examples", description: "Local card effect demos (no licensed imagery)." },
  { dir: path.join(GENERATED_ROOT, "example"), name: "example", description: "Local card effect demos (no licensed imagery)." },
  { dir: path.join(GENERATED_ROOT, "work"), name: "work", description: "Work" },
  { dir: path.join(GENERATED_ROOT, "about"), name: "about", description: "About" },
  { dir: path.join(GENERATED_ROOT, "services"), name: "services", description: "Services" },
  { dir: path.join(GENERATED_ROOT, "contact"), name: "contact", description: "Contact" },
  { dir: path.join(GENERATED_ROOT, "privacy"), name: "privacy", description: "Privacy policy" },
  { dir: path.join(GENERATED_ROOT, "terms"), name: "terms", description: "Terms and conditions" }
];

const readJson = <T>(filePath: string): T => JSON.parse(fs.readFileSync(filePath, "utf8")) as T;

const baseSlugFromStickerId = (id: unknown): string =>
  (id ?? "").toString().replace(/^stickers-/, "").replace(/-\d+$/, "");
const fullSlugFromStickerId = (id: unknown): string =>
  (id ?? "").toString().replace(/^stickers-/, "");

const ensureDir = (dirPath: string): void => fs.mkdirSync(dirPath, { recursive: true });

const ensureDirSymlink = (linkPath: string, targetPath: string): void => {
  try {
    const stat = fs.lstatSync(linkPath);
    if (stat.isSymbolicLink()) {
      const linkedTo = path.resolve(path.dirname(linkPath), fs.readlinkSync(linkPath));
      if (linkedTo === targetPath) return;
    }
    fs.rmSync(linkPath, { recursive: true, force: true });
  } catch {
    // Missing path is expected on first run.
  }

  ensureDir(path.dirname(linkPath));
  const relativeTarget = path.relative(path.dirname(linkPath), targetPath) || ".";
  fs.symlinkSync(relativeTarget, linkPath, "dir");
};

const escapeHtmlAttr = (value: unknown): string =>
  (value ?? "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const escapeHtmlText = (value: unknown): string =>
  (value ?? "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const publicPathToFsPath = (publicPath: string): string =>
  path.join(PUBLIC_ROOT, (publicPath || "").toString().replace(/^\/+/, ""));

const CARD_CSS_SOURCES = [
  "/css/cards/base.css",
  "/css/cards.css",
  "/css/cards/basic.css",
  "/css/cards/reverse-holo.css",
  "/css/cards/regular-holo.css",
  "/css/cards/cosmos-holo.css",
  "/css/cards/amazing-rare.css",
  "/css/cards/radiant-holo.css",
  "/css/cards/v-regular.css",
  "/css/cards/v-full-art.css",
  "/css/cards/v-max.css",
  "/css/cards/v-star.css",
  "/css/cards/trainer-full-art.css",
  "/css/cards/rainbow-holo.css",
  "/css/cards/rainbow-alt.css",
  "/css/cards/secret-rare.css",
  "/css/cards/trainer-gallery-holo.css",
  "/css/cards/trainer-gallery-v-regular.css",
  "/css/cards/trainer-gallery-v-max.css",
  "/css/cards/trainer-gallery-secret-rare.css",
  "/css/cards/shiny-rare.css",
  "/css/cards/shiny-v.css",
  "/css/cards/shiny-vmax.css",
  "/css/cards/spiral-holographic.css",
  "/css/cards/swsh-pikachu.css",
  "/css/cards/stickers.css",
];

const buildCardCssBundle = (): void => {
  const outPath = publicPathToFsPath(CARD_CSS_BUNDLE_PUBLIC_PATH);
  ensureDir(path.dirname(outPath));

  const chunks = [];
  for (const publicPath of CARD_CSS_SOURCES) {
    const srcPath = publicPathToFsPath(publicPath);
    const raw = fs.readFileSync(srcPath, "utf8");
    chunks.push(`/* ---- ${publicPath} ---- */\n\n${raw.trimEnd()}\n`);
  }

  fs.writeFileSync(outPath, chunks.join("\n"), "utf8");
};

const pickOgImage = (candidates: Array<string | undefined>): string => {
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (fs.existsSync(publicPathToFsPath(candidate))) return candidate;
  }
  return OG_DEFAULT_PUBLIC_PATH;
};

const absoluteUrlForPublicPath = (publicPath: string): string => {
  const cleaned = (publicPath || "").toString().replace(/^\/+/, "");
  return `${SITE_URL_PLACEHOLDER}${BASE_PLACEHOLDER}${cleaned}`;
};

const absoluteUrlForRoute = (routePath: string): string => {
  const cleaned = (routePath || "").toString().replace(/^\/+/, "");
  return `${SITE_URL_PLACEHOLDER}${BASE_PLACEHOLDER}${cleaned}`;
};

const htmlForRoute = ({ name, description }: PageMetadata): string => {
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

    <link rel="stylesheet" href="${CARD_CSS_BUNDLE_PUBLIC_PATH}" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;
};

const htmlForSlug = ({ slug, title, description }: StickerPageMetadata): string => {
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

    <link rel="stylesheet" href="${CARD_CSS_BUNDLE_PUBLIC_PATH}" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;
};

const main = (): void => {
  buildCardCssBundle();
  // Rebuild the generated-root workspace from scratch so removed stickers/routes
  // don't leave stale HTML entrypoints behind.
  fs.rmSync(GENERATED_ROOT, { recursive: true, force: true });
  ensureDir(GENERATED_ROOT);
  fs.copyFileSync(MAIN_INDEX_SRC, MAIN_INDEX_OUT);
  ensureDirSymlink(GENERATED_SRC_LINK, path.join(ROOT, "src"));

  // These routes are pure static entrypoints for Vite multi-page builds.
  // They are intentionally generated into a hidden folder to keep repo root clean.
  for (const route of STATIC_ROUTES) {
    ensureDir(route.dir);
    fs.writeFileSync(path.join(route.dir, "index.html"), htmlForRoute(route), "utf8");
  }

  const stickers = readJson<StickerRecord[]>(STICKERS_JSON) || [];
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
