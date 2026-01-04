# stickers

[![build](https://github.com/GrantBirki/stickers/actions/workflows/build.yml/badge.svg)](https://github.com/GrantBirki/stickers/actions/workflows/build.yml)
[![test](https://github.com/GrantBirki/stickers/actions/workflows/test.yml/badge.svg)](https://github.com/GrantBirki/stickers/actions/workflows/test.yml)

The website for stickers.birki.io - Grant's collection of sticker drops!

## Dev

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run validate` (runs ESLint + svelte-check)

## Generated Sticker Inspect Pages

This repo generates a **dark-mode-only** "inspect" page for every sticker in `public/data/stickers.json`.

- Route shape: `/stickers/<slug>/`
- Example: `id: "mike-mike-dms"` -> `/stickers/mike-mike-dms/`
- The inspect page intentionally has **no header, no footer, and no theme toggle**. It renders just the
  card in the expanded ("large") state so you can inspect/iterate on styling.

### How The Pages Are Generated

We generate a few small static HTML entrypoints so the site can be hosted as a fully static build and
still support direct links (no server-side routing required).

- Script: `scripts/generate-sticker-pages.mjs`
- Outputs:
  - `stickers/<slug>/index.html` (one folder per sticker)
  - `examples/index.html` (hidden CSS effect playground route)
  - `example/index.html` (alias for `/examples/`)
  - `work/index.html`, `about/index.html`, `services/index.html`, `contact/index.html`, `privacy/index.html`, `terms/index.html`
- When it runs:
  - `npm run dev` runs it automatically via `predev`
  - `npm run build` runs it automatically via `prebuild`

You can also run it manually:

```bash
node scripts/generate-sticker-pages.mjs
```

Notes:

- `<slug>` is derived from the sticker `id` by stripping the `stickers-` prefix and the trailing numeric
  suffix (e.g. `-001`). If multiple stickers would collide on the same base slug, the full id suffix is
  used to keep slugs unique.

## Site Config

Global site toggles live in `public/data/site.json`.

- `display_next_card_as_hidden` (boolean): when `true`, the next card slot on the homepage shows a
  dark/muted "mystery" placeholder using `public/img/mystery.png`.

## Open Graph / Social Preview Images

This site ships Open Graph + Twitter meta tags for rich link previews (Twitter/X, Discord, iMessage,
Slack, etc).

To add preview images, just drop PNGs in `public/og/`:

- Default (used everywhere unless overridden): `public/og/default.png`
- Optional per-route overrides:
  - `public/og/about.png` -> `/about/`
  - `public/og/contact.png` -> `/contact/`
  - `public/og/services.png` -> `/services/`
  - `public/og/work.png` -> `/work/`
  - `public/og/privacy.png` -> `/privacy/`
  - `public/og/terms.png` -> `/terms/`
- Optional per-sticker overrides:
  - `public/og/stickers/<slug>.png` -> `/stickers/<slug>/`

Recommended image size: **1200x630**.

Meta tags use `%VITE_SITE_URL%` and `%VITE_BASE%` at build time.
- For deployments: set `VITE_SITE_URL` (and optionally `VITE_BASE`) in your CI/deploy environment
  so builds output absolute URLs (best compatibility for previews).
- If `VITE_SITE_URL` is not set, the site will fall back to relative URLs in the built HTML.

## Fonts

This site uses **local** Mona Sans variable fonts (no Google Fonts / CDNs).

- Font files: `public/fonts/mona-sans/` (includes `OFL.txt`)
- `@font-face` + typography defaults: `public/css/global.css`

## Adding A Sticker Card

1) Put the sticker image in `public/img/stickers/` (PNG works great).
2) (Optional) Put a custom back image somewhere under `public/img/` (for example `public/img/backs/`).
3) Add an entry to `public/data/stickers.json`.

Example:

```json
{
  "id": "my-sticker",
  "name": "My Sticker",
  "set": "stickers",
  "number": "0001",
  "rarity": "holographic",
  "sticker_img": "/img/stickers/my-sticker.png",
  "card_front_img": "/img/card_front_texture.png",
  "card_back_img": "/img/backs/my-back.png",
  "drop_date": "2026-01-02",
  "description": "Short description",
  "total_prints": 10
}
```

Notes:

- `sticker_img`, `card_front_img`, and `card_back_img` are public paths (they should start with `/img/...`).
- `card_front_img` is optional; if omitted the default sticker face texture is used.
- `card_back_img` is optional; if omitted the default back image is used.
- After adding a sticker, the inspect page will be generated automatically (see "Generated Sticker Inspect Pages").

## Rarity Tokens

This project uses short rarity tokens everywhere (no long rarity names with spaces).
Set these on the `rarity` field in `public/data/stickers.json`.

- `holofoil` -> `Rare Holo`
- `spiral-holographic` -> Custom combo of `holographic` and `holofoil-alt-1`
- `common` -> `Common`
- `uncommon` -> `Uncommon`
- `galaxy` -> `Rare Holo Cosmos`
- `rare` -> `Amazing Rare`
- `radiant` -> `Radiant Rare`
- `holographic` -> `Trainer Gallery Rare Holo`
- `steel` -> `Rare Holo V`
- `ultra-rare` -> `Rare Ultra`
- `rare-rainbow` -> `Rare Rainbow`
- `holofoil-alt-1` -> `Rare Holo VMAX`
- `holofoil-alt-2` -> `Rare Holo VSTAR`
- `ancient` -> `Rare Secret`
- `shiny` -> `Rare Shiny`

## Card Backs

Each card can optionally set its own back image with the `card_back_img` field (example above).

If `card_back_img` is not provided (or is `null`), the card uses the default back image set in
`src/lib/components/Card.svelte`.

## Examples

The CSS effect playground renders on `/examples/` (and an alias at `/example/`).
It intentionally repeats a single local image so the site doesn't ship licensed card art.
This page is intentionally not linked from the UI; visit it directly by typing `/examples/`.

## Deployment

This site is designed to deploy as a static build.

- Output folder: `dist/`
- Custom domain: `https://stickers.birki.io` (root path)
  - No special base-path config is needed for this setup (it builds with `/` as the base by default).
  - If you ever deploy to a GitHub project subpath instead, set `VITE_BASE=/your-repo-name/` at build time.

## Acknowledgements

- [Card examples](https://poke-holo.simey.me)
- [github.com/simeydotme/pokemon-cards-css](https://github.com/simeydotme/pokemon-cards-css)
