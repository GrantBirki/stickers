# stickers

[![build](https://github.com/GrantBirki/stickers/actions/workflows/build.yml/badge.svg)](https://github.com/GrantBirki/stickers/actions/workflows/build.yml)
[![test](https://github.com/GrantBirki/stickers/actions/workflows/test.yml/badge.svg)](https://github.com/GrantBirki/stickers/actions/workflows/test.yml)
[![lint](https://github.com/GrantBirki/stickers/actions/workflows/lint.yml/badge.svg)](https://github.com/GrantBirki/stickers/actions/workflows/lint.yml)
[![deploy](https://github.com/GrantBirki/stickers/actions/workflows/deploy.yml/badge.svg)](https://github.com/GrantBirki/stickers/actions/workflows/deploy.yml)
[![Unlock On Merge](https://github.com/GrantBirki/stickers/actions/workflows/unlock-on-merge.yml/badge.svg)](https://github.com/GrantBirki/stickers/actions/workflows/unlock-on-merge.yml)

The website for stickers.birki.io — Grant's collection of sticker drops.

The project is a static TypeScript site with one exact-pinned development dependency: TypeScript itself. Page generation, the development server, testing, assertions, coverage, file operations, and HTTP serving use Node's standard library. The browser receives repository-owned HTML, CSS, images, fonts, and a small TypeScript-compiled interaction module; no client framework or third-party runtime code is shipped.

## Dev

- Bootstrap the exact lockfile: `./script/bootstrap`
- Start the local static server: `./script/server`
- Build the production site: `./script/build`
- Run strict TypeScript checks: `./script/lint`
- Run standard-library tests with V8 coverage: `./script/test`

The wrappers are the supported interface for humans, automation, and CI. Local dependency installation requires [Socket Firewall](https://socket.dev/products/socket-firewall); CI uses lockfile-faithful `npm ci`.

## Architecture

Source data lives in `public/data/stickers.json` and `public/data/site.json`. `scripts/build.mts` copies repository-owned public assets into `dist/`, combines the card effect stylesheets, and renders complete static HTML for every route. `tsc` then compiles the small browser runtime from `src/` into `dist/assets/`.

Important source files:

- `src/lib/render.ts`: escaping, card markup, page shells, metadata, and route content
- `src/lib/browser.ts`: theme selection, card pointer/orientation effects, expansion, flipping, and showcase animation
- `src/lib/examples.ts`: examples-page card data
- `src/lib/helpers/`: pure math and sticker-slug helpers
- `scripts/build.mts`: dependency-free production builder
- `scripts/server.mts`: dependency-free local static server with safe path resolution
- `public/css/app.css`: application layout and component styles
- `public/css/cards/`: card effect styles

## Generated Routes

`./script/build` writes all deployable output to `dist/`:

- `/`
- `/examples/` and `/example/`
- `/work/`, `/about/`, `/services/`, `/contact/`, `/privacy/`, and `/terms/`
- `/stickers/<slug>/` for every sticker

The inspect route has no header, footer, or theme toggle. Clicking its card flips between the front and back.

Sticker slugs are derived by stripping a `stickers-` prefix and a trailing numeric suffix such as `-001`. If two stickers collide on the same base slug, later cards use the full identifier suffix.

Generated files are not committed. The repository owns source data and assets; CI regenerates `dist/` from them for each build.

## Site Config

Global site toggles live in `public/data/site.json`.

- `display_next_card_as_hidden`: when `true`, the homepage appends a muted mystery card using `public/img/mystery.png`.

## Open Graph Images

Place PNG previews in `public/og/`:

- Default: `public/og/default.png`
- Route-specific: `public/og/about.png`, `public/og/contact.png`, and similar
- Sticker-specific: `public/og/stickers/<slug>.png`

The recommended size is 1200×630. Set `VITE_SITE_URL` during deployment for absolute canonical and social URLs.

## Adding A Sticker Card

1. Put the sticker image in `public/img/stickers/`.
2. Optionally put a custom back image under `public/img/`.
3. Add an entry to `public/data/stickers.json`.
4. Run `./script/test`.

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

Image fields are public-root paths. `card_front_img` and `card_back_img` are optional; the renderer supplies the standard card textures when they are absent.

## Rarity Tokens

- `holofoil` → Rare Holo
- `spiral-holographic` → custom spiral holographic effect
- `common` → Common
- `uncommon` → Uncommon
- `galaxy` → Rare Holo Cosmos
- `rare` → Amazing Rare
- `radiant` → Radiant Rare
- `holographic` → Trainer Gallery Rare Holo
- `steel` → Rare Holo V
- `ultra-rare` → Rare Ultra
- `rare-rainbow` → Rare Rainbow
- `holofoil-alt-1` → Rare Holo VMAX
- `holofoil-alt-2` → Rare Holo VSTAR
- `ancient` → Rare Secret
- `shiny` → Rare Shiny

## Assets And Availability

Mona Sans fonts, card art, textures, Open Graph images, and all runtime CSS are served from this repository. Runtime availability does not depend on a CDN or package registry.

## Acknowledgements

- [Card examples](https://poke-holo.simey.me)
- [github.com/simeydotme/pokemon-cards-css](https://github.com/simeydotme/pokemon-cards-css)
