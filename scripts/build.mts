import fs from "node:fs";
import path from "node:path";

import {
  buildSlugMap,
  renderDocument,
  renderExamples,
  renderHome,
  renderInspect,
  renderStaticPage,
  staticPages,
} from "../src/lib/render.ts";
import type { CardData, SiteConfig } from "../src/lib/types.ts";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const outputRoot = path.join(root, "dist");
const base = process.env.VITE_BASE || "/";
const siteUrl = (process.env.VITE_SITE_URL || "").replace(/\/+$/, "");

const cardCssSources = [
  "css/cards/base.css",
  "css/cards.css",
  "css/cards/basic.css",
  "css/cards/reverse-holo.css",
  "css/cards/regular-holo.css",
  "css/cards/cosmos-holo.css",
  "css/cards/amazing-rare.css",
  "css/cards/radiant-holo.css",
  "css/cards/v-regular.css",
  "css/cards/v-full-art.css",
  "css/cards/v-max.css",
  "css/cards/v-star.css",
  "css/cards/trainer-full-art.css",
  "css/cards/rainbow-holo.css",
  "css/cards/rainbow-alt.css",
  "css/cards/secret-rare.css",
  "css/cards/trainer-gallery-holo.css",
  "css/cards/trainer-gallery-v-regular.css",
  "css/cards/trainer-gallery-v-max.css",
  "css/cards/trainer-gallery-secret-rare.css",
  "css/cards/shiny-rare.css",
  "css/cards/shiny-v.css",
  "css/cards/shiny-vmax.css",
  "css/cards/spiral-holographic.css",
  "css/cards/swsh-pikachu.css",
  "css/cards/stickers.css",
];

const readJson = <T>(relativePath: string): T =>
  JSON.parse(fs.readFileSync(path.join(publicRoot, relativePath), "utf8")) as T;

const writePage = (relativePath: string, html: string): void => {
  const destination = path.join(outputRoot, relativePath, "index.html");
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, html, "utf8");
};

const ogImage = (candidate: string): string =>
  fs.existsSync(path.join(publicRoot, candidate)) ? candidate : "og/default.png";

fs.rmSync(outputRoot, { force: true, recursive: true });
fs.cpSync(publicRoot, outputRoot, { recursive: true });

const cardCss = cardCssSources.map((source) =>
  `/* ---- /${source} ---- */\n\n${fs.readFileSync(path.join(publicRoot, source), "utf8").trimEnd()}\n`
).join("\n");
fs.writeFileSync(path.join(outputRoot, "css/cards/all.css"), cardCss, "utf8");

const stickers = readJson<CardData[]>("data/stickers.json");
const config = readJson<SiteConfig>("data/site.json");
const slugs = buildSlugMap(stickers);

writePage("", renderDocument(renderHome(stickers, config), {
  base,
  metadata: {
    canonicalPath: "",
    description: "Sticker trading cards with holographic CSS effects.",
    ogImage: "og/default.png",
    title: "birki stickers",
  },
  siteUrl,
}));

for (const route of ["examples", "example"]) {
  writePage(route, renderDocument(renderExamples(), {
    base,
    metadata: {
      canonicalPath: `${route}/`,
      description: "Local card effect demos (no licensed imagery).",
      ogImage: ogImage(`og/${route}.png`),
      title: `birki stickers / ${route}`,
    },
    siteUrl,
  }));
}

for (const [route, page] of Object.entries(staticPages)) {
  writePage(route, renderDocument(renderStaticPage(page.title, page.subtitle), {
    base,
    metadata: {
      canonicalPath: `${route}/`,
      description: page.subtitle,
      ogImage: ogImage(`og/${route}.png`),
      title: `birki stickers / ${route}`,
    },
    siteUrl,
  }));
}

for (const sticker of stickers) {
  const slug = slugs[sticker.id];
  if (!slug) continue;
  writePage(path.join("stickers", slug), renderDocument(renderInspect(sticker), {
    base,
    inspect: true,
    metadata: {
      canonicalPath: `stickers/${slug}/`,
      description: sticker.description || "Sticker card inspect view.",
      ogImage: ogImage(`og/stickers/${slug}.png`),
      title: `${sticker.name || slug} | birki stickers`,
    },
    siteUrl,
  }));
}

console.log(`Built ${stickers.length + Object.keys(staticPages).length + 3} pages in dist/`);
