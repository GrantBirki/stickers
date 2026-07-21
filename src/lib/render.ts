import { exampleGroups, showcase } from "./examples.ts";
import { baseSlugFromStickerId, fullSlugFromStickerId } from "./helpers/stickerSlugs.ts";
import type { CardData, SiteConfig } from "./types.ts";

export interface PageMetadata {
  canonicalPath: string;
  description: string;
  ogImage: string;
  title: string;
}

export interface RenderOptions {
  base: string;
  inspect?: boolean;
  metadata: PageMetadata;
  siteUrl: string;
}

export const staticPages: Record<string, { title: string; subtitle: string }> = {
  work: { title: "Work", subtitle: "Selected projects and experiments." },
  about: { title: "About", subtitle: "A tiny studio making playful internet objects." },
  services: { title: "Services", subtitle: "Design, prototyping, and UI engineering." },
  contact: { title: "Contact", subtitle: "Say hello." },
  privacy: { title: "Privacy", subtitle: "No trackers. No ads. Just stickers." },
  terms: { title: "Terms", subtitle: "Be kind. Don't scrape. Enjoy the drops." },
};

export const escapeHtml = (value: unknown): string =>
  (value ?? "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const normalizeBase = (base: string): string => {
  const value = `/${(base || "/").replace(/^\/+|\/+$/g, "")}/`;
  return value === "//" ? "/" : value;
};

export const publicUrl = (base: string, asset: string): string =>
  `${normalizeBase(base)}${asset.replace(/^\/+/, "")}`;

export const buildSlugMap = (stickers: CardData[]): Record<string, string> => {
  const used = new Set<string>();
  const result: Record<string, string> = {};
  for (const sticker of stickers) {
    const base = baseSlugFromStickerId(sticker.id);
    const full = fullSlugFromStickerId(sticker.id);
    const slug = base && !used.has(base) ? base : full;
    if (!slug || !sticker.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) continue;
    used.add(slug);
    result[sticker.id] = slug;
  }
  return result;
};

export const resolveImgSrc = (src: string | undefined): string => {
  if (!src) return "";
  if (/^(?:https?:|data:|\/)/.test(src)) return src;
  return `/${src.replace(/^\.\//, "")}`;
};

export const formatDropDate = (value: unknown): string =>
  value ? value.toString().trim().replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$1/$2/$3") : "";

const normalize = (value: unknown): string => (value ?? "").toString().toLowerCase();
const normalizeList = (value: unknown): string =>
  Array.isArray(value) ? value.join(" ").toLowerCase() : normalize(value);

const deterministicSeed = (value: string): { x: number; y: number } => {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  const unsigned = hash >>> 0;
  return { x: (unsigned % 1009) / 1009, y: ((unsigned >>> 11) % 1013) / 1013 };
};

const cssUrl = (src: string): string => {
  const escaped = resolveImgSrc(src).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\r\n]/g, "");
  return `url(&quot;${escapeHtml(escaped)}&quot;)`;
};

export interface CardRenderOptions {
  flipOnClick?: boolean;
  inspectSlug?: string;
  priority?: boolean;
  showcase?: boolean;
}

export const renderCard = (card: CardData, options: CardRenderOptions = {}): string => {
  const rarity = normalize(card.rarity) || "common";
  const set = normalize(card.set);
  const number = normalize(card.number);
  const types = normalizeList(card.types);
  const subtypes = normalizeList(card.subtypes) || "basic";
  const supertype = normalize(card.supertype) || "pokémon";
  const isSticker = set === "stickers";
  const isMystery = isSticker && card.variant === "mystery";
  const foilScope = isSticker && !["common", "uncommon"].includes(rarity) ? "full" : "art";
  const front = resolveImgSrc(isSticker && !isMystery ? card.sticker_img || card.img : card.card_front_img || card.img);
  const back = resolveImgSrc(card.card_back_img || card.back || "/img/oai_back.png");
  const seed = deterministicSeed(card.id);
  const frontOverride = isSticker && !isMystery && card.card_front_img
    ? `--card-front-img:${cssUrl(card.card_front_img)};--front-texture-opacity:0;`
    : "";
  const maskAndFoil = `${card.mask ? `--mask:${cssUrl(card.mask)};` : ""}${card.foil ? `--foil:${cssUrl(card.foil)};` : ""}`;
  const styles = `--pointer-x:50%;--pointer-y:50%;--pointer-from-center:0;--pointer-from-top:.5;--pointer-from-left:.5;--card-opacity:0;--rotate-x:0deg;--rotate-y:0deg;--flip:0deg;--background-x:50%;--background-y:50%;--card-scale:1;--translate-x:0px;--translate-y:0px;--seedx:${seed.x};--seedy:${seed.y};--cosmosbg:${Math.floor(seed.x * 734)}px ${Math.floor(seed.y * 1280)}px;${frontOverride}${maskAndFoil}`;
  const attrs = [
    `class="card ${escapeHtml(types)} interactive loading${card.mask ? " masked" : ""}"`,
    `data-card-id="${escapeHtml(card.id)}"`,
    `data-number="${escapeHtml(number)}"`,
    `data-set="${escapeHtml(set)}"`,
    `data-subtypes="${escapeHtml(subtypes)}"`,
    `data-supertype="${escapeHtml(supertype)}"`,
    `data-rarity="${escapeHtml(rarity)}"`,
    `data-trainer-gallery="${/^(?:tg|gg)/i.test(number) || ["swshp-SWSH076", "swshp-SWSH077"].includes(card.id)}"`,
    isSticker ? `data-sticker-foil="${foilScope}"` : "",
    card.hidden ? 'data-hidden="true"' : "",
    card.variant ? `data-variant="${escapeHtml(card.variant)}"` : "",
    options.inspectSlug ? `data-inspect-href="/stickers/${escapeHtml(options.inspectSlug)}/"` : "",
    options.showcase ? 'data-showcase="true"' : "",
    `style="${styles}"`,
  ].filter(Boolean).join(" ");
  const eager = options.priority ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" fetchpriority="auto"';
  const image = (className: string, alt: string): string =>
    `<img class="${className}" src="${escapeHtml(front)}" alt="${escapeHtml(alt)}" ${eager} width="660" height="921" />`;

  let face: string;
  if (isSticker && isMystery) {
    face = `<div class="sticker__bg" aria-hidden="true"></div>${image("card__face mystery__face", "A mystery card")}`;
  } else if (isSticker) {
    const shine = '<div class="card__shine"></div><div class="card__glare"></div>';
    face = `<div class="sticker__bg" aria-hidden="true"></div>${foilScope === "full" ? shine : ""}<div class="sticker__header"><div class="sticker__title">${escapeHtml(card.name)}</div></div><div class="sticker__art"><div class="sticker__art-bg" aria-hidden="true"></div><div class="sticker__art-inner">${image("card__face sticker__face", `Front image for the ${card.name} card`)}</div><div class="sticker__frame" aria-hidden="true"></div>${foilScope === "art" ? shine : ""}</div><div class="sticker__meta">${card.drop_date ? `<div class="sticker__date">${escapeHtml(formatDropDate(card.drop_date))}</div>` : ""}${card.description ? `<div class="sticker__desc">${escapeHtml(card.description)}</div>` : ""}</div><div class="sticker__footer">${card.total_prints ? `<div class="sticker__prints">Total prints: ${escapeHtml(card.total_prints)}</div>` : ""}${card.number ? `<div class="sticker__card-number">${escapeHtml(card.number)}</div>` : ""}</div>`;
  } else {
    face = `${image("card__face", `Front image for the ${card.name} card`)}<div class="card__shine"></div><div class="card__glare"></div>`;
  }

  const action = options.flipOnClick ? "Flip" : "Expand";
  return `<div ${attrs}><div class="card__translater"><button class="card__rotator" type="button" data-flip-on-click="${options.flipOnClick === true}" aria-label="${action} card: ${escapeHtml(card.name)}."><img class="card__back" src="${escapeHtml(back)}" alt="The back of a trading card" loading="lazy" width="660" height="921" /><div class="card__front">${face}</div></button></div></div>`;
};

export const renderCardGrid = (cards: CardData[], slugs: Record<string, string> = {}): string =>
  `<section class="card-grid">${cards.map((card, index) => renderCard(card, { inspectSlug: slugs[card.id], priority: index === 0 })).join("")}</section>`;

export const renderHome = (stickers: CardData[], config: SiteConfig): string => {
  const slugs = buildSlugMap(stickers);
  const cards = config.display_next_card_as_hidden
    ? [...stickers, { id: "stickers-mystery", name: "Mystery", set: "stickers", rarity: "holographic", card_front_img: "/img/mystery.png", card_back_img: "/img/card_front_texture_gray.png", hidden: true, variant: "mystery" }]
    : stickers;
  return `<section class="home"><header class="home__header"><div class="home__eyebrow">Limited Editions</div><h1 class="home__title">Sticker Drops</h1><p class="home__desc">A collection of sticker drops from Grant.</p><p class="home__cta"><span class="home__cta-lead">Do you work with Grant?</span><span class="home__cta-body">Follow <code class="inline-code">#birki-sticker-drops</code> in Slack to catch the next sticker drop.</span></p><div class="home__rule" aria-hidden="true"></div></header>${renderCardGrid(cards, slugs)}<a class="inspect-fab" href="/" data-inspect-button="true" aria-label="Open inspect view" hidden><svg class="inspect-fab__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 9h-4V5h4"/><path d="M15 9h4V5h-4"/><path d="M9 15h-4v4h4"/><path d="M15 15h4v4h-4"/></svg><span class="inspect-fab__label">inspect</span></a></section>`;
};

export const renderExamples = (): string => {
  const groups = exampleGroups.map((group) => `<h2 id="⚓-${escapeHtml(group.anchor)}"><a href="#⚓-${escapeHtml(group.anchor)}">${escapeHtml(group.title)}</a></h2>${group.description ? `<p>${escapeHtml(group.description)}</p>` : ""}${renderCardGrid(group.cards)}`).join("");
  return `<section class="examples"><header class="examples__header"><div><h1>Examples</h1><p class="examples__sub">CSS effect playground using a single local image (<code>#mike-mike-dms</code>) so we don't ship licensed card art.</p></div><div class="showcase">${renderCard(showcase, { showcase: true })}</div></header>${groups}</section>`;
};

export const renderStaticPage = (title: string, subtitle: string): string =>
  `<section class="page"><h1>${escapeHtml(title)}</h1><p class="page__sub">${escapeHtml(subtitle)}</p></section>`;

export const renderInspect = (sticker: CardData): string =>
  `<div class="inspect">${renderCard(sticker, { flipOnClick: true, priority: true })}</div>`;

const renderThemeToggle = (): string => `<button type="button" class="theme-toggle" role="switch" aria-checked="false" aria-label="Toggle theme" title="Toggle theme"><span class="theme-toggle__track" aria-hidden="true"><span class="theme-toggle__icon theme-toggle__icon--sun"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 18a6 6 0 1 1 0-12a6 6 0 0 1 0 12ZM11 1h2v3h-2V1Zm0 19h2v3h-2v-3ZM3.5 4.9l1.4-1.4l2.1 2.1L5.6 7L3.5 4.9ZM17 18.4l1.4-1.4l2.1 2.1l-1.4 1.4L17 18.4ZM1 11h3v2H1v-2Zm19 0h3v2h-3v-2ZM3.5 19.1L5.6 17l1.4 1.4l-2.1 2.1l-1.4-1.4ZM17 5.6l2.1-2.1l1.4 1.4L18.4 7L17 5.6Z" fill="currentColor"/></svg></span><span class="theme-toggle__icon theme-toggle__icon--moon"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M21 14.6A8.1 8.1 0 0 1 9.4 3a7 7 0 1 0 11.6 11.6Z" fill="currentColor"/></svg></span><span class="theme-toggle__thumb" data-theme="light"></span></span></button>`;

const renderFooter = (): string => `<footer class="studio-footer"><div class="studio-footer__inner"><div class="studio-footer__rule" aria-hidden="true"></div><div class="studio-footer__hero"><div class="studio-footer__wordmark" aria-hidden="true">BIRKI</div><a class="studio-footer__source" href="https://github.com/GrantBirki/stickers" target="_blank" rel="noopener noreferrer"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg><span class="studio-footer__source-text">source code</span></a><div class="studio-footer__signature">Made with ❤️ by Grant Birkinbine</div></div></div></footer>`;

export const renderDocument = (content: string, options: RenderOptions): string => {
  const base = normalizeBase(options.base);
  const canonical = `${options.siteUrl}${publicUrl(base, options.metadata.canonicalPath)}`;
  const ogImage = `${options.siteUrl}${publicUrl(base, options.metadata.ogImage)}`;
  const app = options.inspect
    ? `<div class="app"><main class="content content--inspect">${content}</main></div>`
    : `<div class="app app--has-footer"><div class="topbar"><div class="topbar__actions">${renderThemeToggle()}</div></div><main class="content">${content}</main>${renderFooter()}</div>`;
  const asset = (path: string): string => escapeHtml(publicUrl(base, path));
  return `<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="color-scheme" content="light dark"/><title>${escapeHtml(options.metadata.title)}</title><meta name="description" content="${escapeHtml(options.metadata.description)}"/><link rel="canonical" href="${escapeHtml(canonical)}"/><meta property="og:site_name" content="birki stickers"/><meta property="og:type" content="website"/><meta property="og:title" content="${escapeHtml(options.metadata.title)}"/><meta property="og:description" content="${escapeHtml(options.metadata.description)}"/><meta property="og:url" content="${escapeHtml(canonical)}"/><meta property="og:image" content="${escapeHtml(ogImage)}"/><meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/><meta property="og:image:type" content="image/png"/><meta property="og:image:alt" content="birki stickers preview image"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${escapeHtml(options.metadata.title)}"/><meta name="twitter:description" content="${escapeHtml(options.metadata.description)}"/><meta name="twitter:image" content="${escapeHtml(ogImage)}"/><link rel="icon" href="${asset("favicon.png")}"/><script>(()=>{try{const s=localStorage.getItem("theme"),d=window.matchMedia?.("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=s==="light"||s==="dark"?s:d?"dark":"light"}catch{}})();</script><link rel="preload" href="${asset("fonts/mona-sans/MonaSansVF.woff2")}" as="font" type="font/woff2" crossorigin/><link rel="preload" href="${asset("fonts/mona-sans/MonaSansMonoVF.woff2")}" as="font" type="font/woff2" crossorigin/><link rel="stylesheet" href="${asset("css/global.css")}"/><link rel="stylesheet" href="${asset("css/app.css")}"/><link rel="stylesheet" href="${asset("css/cards/all.css")}"/></head><body>${app}<script type="module" src="${asset("assets/main.js")}"></script></body></html>\n`;
};
