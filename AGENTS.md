# AGENTS.md

This is the operational guide for humans and coding agents working in `stickers`.

## Project Mission

`stickers` is a static TypeScript site for interactive sticker trading cards. The repository deliberately owns its runtime assets and minimizes registry dependencies to reduce supply-chain exposure and maintenance churn.

The project has one exact-pinned development dependency: TypeScript. Do not add a package when a small, maintainable Node or browser standard-library implementation is sufficient.

## Operating Model

1. Card data lives in `public/data/stickers.json`.
2. Global display configuration lives in `public/data/site.json`.
3. `scripts/build.mts` renders complete static HTML for every route and copies public assets to `dist/`.
4. `tsc` compiles the browser interaction code to `dist/assets/`.
5. GitHub Pages deploys `dist/`.

There is no client framework, bundler, third-party test runner, DOM emulator, or production package dependency.

## Scripts To Rule Them All

Use repository wrappers instead of raw implementation commands:

1. `./script/bootstrap`
   - CI: deterministic `npm ci`.
   - Local: `sfw npm install`; fails closed when Socket Firewall is unavailable.
2. `./script/server`
   - Builds the site and serves `dist/` at `127.0.0.1:5173` by default.
3. `./script/build`
   - Renders pages and compiles only the browser TypeScript entrypoint and its imports.
4. `./script/lint`
   - Runs strict TypeScript validation without emitting files.
5. `./script/test`
   - Builds, runs `node:test`, and enforces V8 coverage thresholds.

Keep wrappers strict and small with `#!/usr/bin/env bash` and `set -euo pipefail`. CI jobs must call wrappers.

## Toolchain And Dependency Policy

- Node version: `.node-version`
- Package manager: npm
- Registry dependency: exact-pinned `typescript`
- Test stack: `node:test`, `node:assert`, and built-in V8 coverage
- Build/server stack: Node filesystem, path, and HTTP modules

Use Socket Firewall for supported local package-manager operations. Never introduce floating dependency constraints. Any new dependency requires a concrete explanation of why repository-owned code or the standard library is not appropriate and must account for its full transitive graph.

Retain TypeScript because it provides the actual strict type-check and browser emit. Node's native type stripping is appropriate for repository scripts and tests, but it does not replace type checking or downlevel browser output.

## Architecture Map

### Static Renderer

`src/lib/render.ts` owns:

- HTML escaping
- public/base URL normalization
- sticker slug collision handling
- deterministic card markup and visual seeds
- homepage, examples, static-page, and inspect-page markup
- shared metadata and document shell

All untrusted or data-file text must pass through `escapeHtml` before entering generated markup. Avoid adding `innerHTML` browser mutations; render trusted structure at build time.

### Browser Runtime

`src/lib/browser.ts` owns:

- light/dark theme selection and persistence
- pointer-to-card effect calculations
- device-orientation card effects
- homepage card expansion and inspect-button selection
- inspect-page card flipping
- example showcase animation

`src/main.ts` only initializes and composes browser behavior. Keep the runtime small and browser-native.

### Examples

`src/lib/examples.ts` is the data source for `/examples/` and `/example/`. It deliberately reuses one local image so the repository does not ship licensed card art.

### Static Build

`scripts/build.mts`:

1. Recreates `dist/`.
2. Copies `public/` recursively.
3. Combines ordered card CSS sources into `dist/css/cards/all.css`.
4. Reads sticker and site JSON.
5. Renders the homepage, examples aliases, static pages, and per-sticker inspect pages.

`public/css/cards/all.css` is not tracked because it is a build artifact. Keep the source order in `scripts/build.mts` aligned with the card effect cascade.

### Static Server

`scripts/server.mts` serves `dist/` with Node's HTTP module. Its path resolver must continue to reject malformed URL encoding and traversal outside `dist/`.

## Route Contract

Generated routes are:

- `/`
- `/examples/` and `/example/`
- `/work/`, `/about/`, `/services/`, `/contact/`, `/privacy/`, and `/terms/`
- `/stickers/<slug>/` for every sticker

Inspect routes intentionally omit the top bar, theme toggle, and footer. They render one viewport-fitted card that flips on click.

All routes must remain direct-link compatible on static hosting. Do not replace generated route entrypoints with a server rewrite requirement.

## Sticker Slugs

Helpers live in `src/lib/helpers/stickerSlugs.ts`.

1. `baseSlugFromStickerId` strips a `stickers-` prefix and trailing numeric suffix.
2. `fullSlugFromStickerId` strips only the prefix.
3. `buildSlugMap` gives the first card a base slug and later collisions their full slug.

Keep renderer, route output, homepage inspect links, documentation, and tests aligned with these rules.

## Card Data Contract

Common fields in `public/data/stickers.json`:

- `id`: unique identifier and slug source
- `name`: displayed title
- `set`: use `stickers` for the sticker-card layout
- `number`: card number
- `rarity`: CSS rarity token
- `sticker_img`: sticker art-window image
- `card_front_img`: optional face texture override
- `card_back_img`: optional back image override
- `drop_date`: printed as `YYYY/MM/DD`
- `description`: card metadata
- `total_prints`: card metadata
- `hidden` and `variant`: mystery-card behavior

Runtime asset paths should be public-root paths such as `/img/stickers/example.png`. Prefer repository-owned assets over third-party URLs.

## CSS And Visual System

- `public/css/global.css`: fonts, theme tokens, and global styling
- `public/css/app.css`: application layout and former component-level styling
- `public/css/cards/*.css`: card base, rarity, foil, and sticker effects

Card effect CSS consumes `data-*` attributes and custom properties emitted by `renderCard`. When adding or renaming attributes, inspect the full CSS usage before changing the renderer.

## Test And Quality Baseline

`./script/test` covers pure render behavior, slug collisions, HTML escaping, card variants, interaction math, build output, direct routes, server traversal protection, and the one-package lockfile invariant.

Keep tests standard-library-only. Do not add jsdom or a browser emulation package. Browser integration can be expressed as small pure functions plus generated-output tests; use real-browser inspection when a change is visual or interaction-heavy.

## Workflow Guardrails

When adding a sticker:

1. Add the repository-owned image under `public/img/stickers/`.
2. Add or update the data record.
3. Run `./script/test`.
4. Check the homepage and direct inspect route when the visual output changed.

When changing rendering:

1. Preserve HTML escaping for data-derived content.
2. Preserve direct static routes and metadata.
3. Keep card data attributes synchronized with CSS.
4. Keep inspect pages free of normal-page chrome.

When changing dependencies:

1. Audit the complete resolved graph, not only direct dependencies.
2. Prefer removal or repository-owned code.
3. Keep the package and lockfile exact-pinned and synchronized.
4. Preserve the lockfile test that asserts only TypeScript is resolved unless the project owner explicitly accepts a larger graph.

## Availability Philosophy

Critical runtime fonts, images, textures, metadata, CSS, HTML, and JavaScript are served from the repository. Larger source size is acceptable when it removes runtime availability or integrity dependencies on third parties. Generated dependency directories and `dist/` remain untracked.
