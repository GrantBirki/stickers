# AGENTS.md

This file is the operational guide for humans and coding agents working in this repository.
It is intentionally detailed and specific to how `stickers` actually works right now.

Last updated: February 25, 2026 (based on current branch state and local workspace inspection).

## 1) Project Mission And Operating Model

`stickers` is a static Svelte + Vite site for interactive sticker trading cards.

The repo is deliberately data-driven:

1. Card data lives in `public/data/stickers.json`.
2. The homepage reads that JSON and renders cards dynamically.
3. Build-time scripts generate static HTML entrypoints for direct-link routes (including per-sticker inspect pages).
4. CSS rarity/effect styles are applied through card `data-*` attributes.

The key design constraints are:

1. Keep runtime behavior simple and deterministic.
2. Keep deploy artifacts static-host friendly (no server-side routing required).
3. Keep card additions primarily as data changes, not component rewrites.

### 1.1 Availability/Ownership Philosophy (Important)

This repo intentionally vendors runtime assets when practical so the site owns its availability.

Examples in this codebase:

1. Fonts are vendored locally under `public/fonts/mona-sans/` (no external font CDN dependency).
2. Card/sticker imagery and textures are local under `public/img/**`.
3. Open Graph images are local under `public/og/**`.

Working principle:

1. Prefer shipping assets from the repo instead of relying on third-party hosts.
2. Optimize for long-term reliability of `stickers.birki.io`.
3. Larger repo size is acceptable for critical runtime assets.

Practical boundary:

1. Very large/generated dependency directories like `node_modules/` are not committed due size/churn.
2. Vendoring preference applies primarily to runtime assets needed by the deployed site.

## 2) Scripts To Rule Them All (Important)

This repo is moving toward a wrapper-script workflow under `./script/` as the primary developer UX.
If you are automating repetitive commands, prefer adding/updating a `./script/<name>` wrapper.

Current wrappers:

1. `./script/server`
   - Contents: runs `npm run dev`.
   - Purpose: single canonical entrypoint for local dev server.

2. `./script/test`
   - Contents: runs Vitest with coverage via `./node_modules/.bin/vitest run --coverage`.
   - Purpose: single canonical entrypoint for tests and coverage enforcement.

Why this matters:

1. Fewer command variations across humans, CI, and agents.
2. Easier onboarding (`./script/server`, `./script/test` are memorable).
3. Easier to evolve underlying commands without changing every doc/tooling location.

Conventions for script wrappers:

1. Use Bash with:
   - `#!/usr/bin/env bash`
   - `set -euo pipefail`
2. Keep wrappers small and focused (delegate to npm/tool commands).
3. Prefer adding a wrapper over documenting long ad hoc command sequences.
4. When possible, reference wrappers in docs and agent instructions.
5. If a task is “daily-driver” (server, test, lint, build), it should probably have a wrapper.

Potential near-term wrappers (not required yet, but aligned with this model):

1. `./script/build` -> `npm run build`
2. `./script/validate` -> `npm run validate`
3. `./script/generate` -> `node scripts/generate-sticker-pages.mjs`

## 3) Environment And Toolchain Requirements

Pinned runtime:

1. Node version from `.node-version`: `24.11.1`
2. Package manager: `npm`
3. Frontend stack: Svelte 5 + Vite 7
4. Test stack: Vitest + Testing Library + jsdom

Core npm scripts:

1. `predev`: generates static sticker and route entrypoint HTML
2. `dev`: Vite dev server
3. `prebuild`: regenerates static entrypoint HTML
4. `build`: Vite build
5. `validate`: ESLint + svelte-check
6. `test`: delegates to `./script/test`

Practical note:

1. The generator script must run before dev/build, and this is already wired with `predev` and `prebuild`.

## 4) Deep Architecture Map

### 4.1 Runtime App Routing

Main entry:

1. `src/main.js` mounts `App` into `#app` with Svelte 5 `mount()`.

Router behavior in `src/App.svelte`:

1. Uses `window.location.pathname` (client-side path switch).
2. Handles `popstate` and `hashchange`.
3. Routes:
   - `/stickers/*` -> `StickerInspect` (special fullscreen inspect experience)
   - `/examples` or `/example` -> `Examples`
   - static pages (`/work`, `/about`, `/services`, `/contact`, `/privacy`, `/terms`) -> `StaticPage`
   - everything else -> `Home`
4. On inspect routes:
   - No theme toggle
   - No footer
   - Main container uses inspect-specific layout

### 4.2 Homepage Data Flow

`src/pages/Home.svelte`:

1. Fetches `data/stickers.json` and `data/site.json`.
2. Builds a slug map from sticker IDs.
3. Renders cards from data.
4. Optionally appends a mystery placeholder card when `display_next_card_as_hidden` is `true`.
5. Uses `activeStickerId` to show an inspect FAB when a card is active.
6. Handles inspect navigation via `history.pushState` and a `popstate` dispatch.

### 4.3 Inspect Route Data Flow

`src/pages/StickerInspect.svelte`:

1. Fetches `data/stickers.json`.
2. Matches by normalized slug in this order:
   - base slug
   - full slug
3. Renders one card in inspect mode with `flip_on_click={true}`.
4. Locks `document.body.style.overflow = "hidden"` while mounted.

### 4.4 Slug Semantics

Helper: `src/lib/helpers/stickerSlugs.js`.

Rules:

1. `baseSlugFromStickerId(id)`:
   - strips `stickers-` prefix
   - strips trailing numeric suffix `-<digits>`
2. `fullSlugFromStickerId(id)`:
   - strips `stickers-` prefix only
3. `normalizePathSlug(slug)`:
   - trims leading/trailing slashes

Collision behavior:

1. If two stickers share a base slug, first keeps base slug, later entries use full slug.

### 4.5 Card Component Behavior

Core component: `src/lib/components/Card.svelte`.

Relevant props for sticker cards:

1. `id`
2. `name`
3. `set` (must be `"stickers"` for sticker layout path)
4. `number`
5. `rarity`
6. `sticker_img`
7. `card_front_img` (optional texture/face override)
8. `card_back_img` (optional back override)
9. `drop_date`
10. `description`
11. `total_prints`
12. `hidden` and `variant` for mystery behavior

Interactive behavior:

1. Card expansion uses `activeCard` and `activeStickerId` stores.
2. On homepage, expanded card drives inspect FAB visibility.
3. On inspect route, cards are rendered with `flip_on_click` (front/back toggle).
4. Includes pointer-based spring effects and device orientation reaction.

Sticker-specific rendering details:

1. Sticker cards use a dedicated layout in `public/css/cards/stickers.css`.
2. Rarity drives foil scope:
   - `common`/`uncommon`: art-focused behavior
   - other rarities: full-card foil scope

### 4.6 CSS And Visual System

Global styles:

1. `public/css/global.css` defines theme tokens, fonts, and baseline styling.
2. Local Mona Sans font files are served from `public/fonts/mona-sans`.

Card effect styles:

1. Split across many files in `public/css/cards/`.
2. Bundled into `public/css/cards/all.css` by generator script.
3. Sticker cards have dedicated styling in `public/css/cards/stickers.css`.
4. Custom rarity effect `spiral-holographic` is implemented in `public/css/cards/spiral-holographic.css`.

### 4.7 Build-Time Static Entrypoint Generation

Script: `scripts/generate-sticker-pages.mjs`.

What it generates:

1. `stickers/<slug>/index.html` for each sticker from data.
2. Static route entrypoints:
   - `examples/index.html`
   - `example/index.html`
   - `work/index.html`
   - `about/index.html`
   - `services/index.html`
   - `contact/index.html`
   - `privacy/index.html`
   - `terms/index.html`
3. Card CSS bundle: `public/css/cards/all.css`.

Why this exists:

1. Allows direct navigation to route URLs on static hosting without server rewrite support.
2. Keeps static hosting compatibility without requiring committed route HTML files.

Repository tracking policy for generated sticker routes:

1. Generated `stickers/<slug>/index.html` files are build artifacts.
2. They should not be committed by default.
3. The root directory `/stickers/` is gitignored so these files do not pollute `git status`.
4. This is intentionally root-scoped so `public/img/stickers/**` remains trackable.

### 4.8 Build Configuration

`vite.config.js`:

1. Loads env (`VITE_*`) and provides `%VITE_SITE_URL%`/`%VITE_BASE%` replacement via HTML plugin.
2. Computes dynamic Rollup input entries for sticker pages by reading `public/data/stickers.json`.
3. Configures test environment and coverage thresholds.

## 5) Sticker Data Contract (Practical Schema)

Data file:

1. `public/data/stickers.json`

Common fields used in this repo:

1. `id` (string, slug source)
2. `name` (display title)
3. `set` (`"stickers"` for sticker card behavior)
4. `number` (displayed in card footer)
5. `rarity` (maps to CSS rarity styles)
6. `sticker_img` (primary sticker art image path)
7. `card_front_img` (optional face texture/image override)
8. `card_back_img` (optional back face image override)
9. `drop_date` (formatted to `YYYY/MM/DD` on card)
10. `description` (card metadata text)
11. `total_prints` (card metadata text)
12. `hidden` + `variant` for mystery placeholder behavior

All image paths should be public-root paths (e.g. `/img/...`).

## 6) Test And Quality Baseline

Primary test command:

1. `./script/test`

Current observed result (local run on Feb 25, 2026):

1. 13 test files passed
2. 49 tests passed
3. Coverage thresholds passed

Lint/type checks:

1. `npm run validate` runs ESLint + svelte-check.

Coverage thresholds are strict and intentional in `vite.config.js`:

1. lines: 98
2. functions: 100
3. branches: 87
4. statements: 98

## 7) CI/CD And Deployment Notes

GitHub workflows include:

1. `build.yml`
2. `test.yml`
3. `lint.yml`
4. `deploy.yml`
5. branch deploy flow (`branch-deploy.yml`)
6. unlock-on-merge flow

Operational detail:

1. PR comments support `.deploy`-driven production branch deployment flow.
2. New PR template comment includes deployment instructions.

## 8) Sevbot Branch Audit (main...sevbot)

Audit scope:

1. Compared `main` to `HEAD` on branch `sevbot`.
2. Also inspected current uncommitted workspace state.

Committed branch delta (`main...HEAD`):

1. Modified `.gitignore`
   - removed `stickers/` ignore entry
2. Modified `public/data/stickers.json`
   - added `sevbot` sticker record
3. Added image asset
   - `public/img/stickers/i-have-no-mouth-and-i-must-scream.png`

No other committed files differ from `main` in this branch.

Current uncommitted workspace state (observed during this audit):

1. Staged new file: `script/server`
2. `AGENTS.md` added as a new untracked file.
3. Local policy correction: `.gitignore` re-adds root `/stickers/` to hide generated route artifacts without affecting `public/img/stickers/**`.

Why `stickers/*` files appeared previously:

1. Generation script ran via `predev`/`prebuild` (or manual generator run).
2. This branch removed `stickers/` from `.gitignore`, so generated files became visible as untracked.
3. A broad `stickers/` ignore pattern can also match `public/img/stickers/**`, which is not desired.
4. Local fix uses root-scoped `/stickers/` ignore to match intended generated-artifact behavior.

## 9) What Matched vs Diverged From Prior “Mirror Mike” Guidance

Prior guidance intent was: add sevbot card and mirror `mike-mike-dms` wiring unless explicitly changed.
Here is what was actually done.

Matched:

1. New sticker image added under `public/img/stickers/`.
2. New sticker entry added to `public/data/stickers.json`.
3. Uses sticker set and required metadata fields.
4. Reuses existing `card_back_img` (`/img/card_back_oai_dark.png`).
5. New inspect route slug resolves to `/stickers/sevbot/`.

Diverged (intentionally or otherwise):

1. `name`
   - Mike pattern: `#mike-mike-dms`
   - Sevbot actual: `sevbot` (no `#` prefix)
2. `rarity`
   - Mike uses `spiral-holographic`
   - Sevbot uses `ultra-rare`
3. `card_front_img`
   - Mike uses `/img/card_front_texture_silver_holo.png`
   - Sevbot uses `/img/card_front_texture_silver.png`
4. `description`
   - Earlier ask suggested placeholder text for now
   - Sevbot uses concrete text: `I Have No Mouth, and I Must Scream`
5. `drop_date`
   - Mike: `2026-01-02`
   - Sevbot actual set to `2026-03-16`
6. Repo behavior around generated pages
   - Ignore removed for `stickers/`, so generated inspect pages now appear as local changes unless ignored/committed by policy.

None of these divergences inherently break the app. They mostly affect visual style, naming consistency, and workflow hygiene.

## 10) Workflow Guardrails For Future Changes

When adding/updating stickers:

1. Add/verify image asset in `public/img/stickers/`.
2. Add/update row in `public/data/stickers.json`.
3. Run generation (`node scripts/generate-sticker-pages.mjs` or `npm run dev` / `npm run build`).
4. Run tests via `./script/test`.
5. Verify homepage render, card inspect route, and metadata correctness.

When changing command workflows:

1. Prefer `./script/*` wrappers as stable user/agent entrypoints.
2. Keep wrappers strict and tiny.
3. Update docs to point to wrappers when practical.

When touching static generation behavior:

1. Keep slug logic aligned across:
   - `src/lib/helpers/stickerSlugs.js`
   - `scripts/generate-sticker-pages.mjs`
   - `vite.config.js` sticker input generation
2. A mismatch here can cause broken direct routes or missing build inputs.

## 11) Resolved Repo Policy: Generated Sticker Entrypoints Are Untracked

Decision:

1. Do not commit generated `stickers/<slug>/index.html` files by default.
2. Keep root `/stickers/` in `.gitignore`.
3. Keep runtime asset directories like `public/img/stickers/` tracked.

Rationale:

1. Generation is already guaranteed by `predev` and `prebuild`.
2. CI/deploy runs build steps that regenerate required files.
3. Tracking generated route HTML adds churn with little source-of-truth value.

When this policy should be revisited:

1. If deployment ever changes to require checked-in prebuilt route HTML without running build generation.
2. If an explicit archival/versioning requirement for generated HTML is introduced.

## 12) Quick Command Cheatsheet

Preferred local commands:

1. Start dev server: `./script/server`
2. Run tests + coverage: `./script/test`
3. Generate pages manually: `node scripts/generate-sticker-pages.mjs`
4. Validate lint + svelte-check: `npm run validate`
5. Build: `npm run build`

## 13) Final Notes For Agents

1. Treat `public/data/stickers.json` as the source of truth for sticker inventory.
2. Do not assume inspect pages are available unless generation has run.
3. Be careful with slug collisions; base/full fallback behavior is intentional.
4. If adding recurring workflows, prefer new `./script/*` wrappers.
5. If the goal is “mirror an existing card exactly,” diff all field values before finalizing.
