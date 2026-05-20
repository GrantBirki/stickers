---
name: create-new-sticker
description: Add a new sticker card to this stickers repo from a provided image, including vendoring the asset, updating sticker data, choosing card backing/effects, validating, and opening a PR.
---

# Create New Sticker

Use this skill when the user wants to add a new sticker to this repository, especially when they provide or reference an image file and ask for a pull request.

## Workflow

1. Start from the real repo state.
   - Run `git status --short --branch` and confirm the working tree is clean or only contains the user-provided sticker source image.
   - If the user says a prior sticker PR was merged, switch back to `main` and run `git pull --ff-only origin main` before creating a new branch.
   - Read `AGENTS.md`, `public/data/stickers.json`, and the existing files under `public/img/stickers/` before editing.

2. Inspect the sticker input.
   - If the image is in the repo root, treat it as the source artifact to vendor.
   - Use `file <image>` to confirm the format and dimensions.
   - Use image viewing when available so the card name, crop, and orientation are understood before choosing metadata.

3. Pick source-of-truth data values deliberately.
   - `id`: kebab-case slug for the sticker, usually matching the asset basename.
   - `name`: the display name requested by the user.
   - `set`: always `"stickers"`.
   - `number`: next zero-padded number after the highest existing numeric sticker number in `public/data/stickers.json`.
   - `sticker_img`: `/img/stickers/<asset-filename>`.
   - `card_back_img`: use `/img/card_back_oai_dark.png` when the user asks for the shared OpenAI backing.
   - `card_front_img`: follow nearby sticker precedent; for a premium OpenAI-backed sticker, prefer `/img/card_front_texture_silver_holo.png` unless the user asks otherwise.
   - `drop_date`: use the current date in `YYYY-MM-DD` unless the user provides a specific date.
   - `description` and `total_prints`: use user-provided values when present; otherwise match local precedent conservatively.

4. Choose the rarity/effect from the actual repo.
   - Inspect existing sticker rarities in `public/data/stickers.json`.
   - Inspect available effect names from `src/pages/Examples.svelte` and `public/css/cards/*.css`.
   - If the user asks for an unused rare holofoil effect, choose a special non-`common`/`uncommon` rarity that no existing sticker row uses yet.
   - Remember that sticker cards with any special rarity get full-card foil scope through `src/lib/components/Card.svelte`.

5. Vendor the asset and edit data.
   - Move or copy the supplied image into `public/img/stickers/` with a stable kebab-case filename.
   - Update `public/data/stickers.json`; keep it valid JSON and preserve the existing two-space formatting.
   - Do not commit generated route entrypoints under `.generated-pages/`, root route folders, or `dist/`.

6. Validate with repo wrappers.
   - Run `./script/build` first; confirm the new `dist/stickers/<slug>/index.html` route is generated.
   - Run `./script/lint`.
   - Run `./script/test`.
   - Existing npm `min-release-age` warnings are non-blocking unless they turn into command failures.

7. Publish the PR.
   - Create a short branch name without a `codex/` prefix.
   - Stage only the sticker data and asset files intended for the PR.
   - Commit with a concise message, push the branch, and open a GitHub PR with a short markdown body.
   - In the final response, include the PR URL, branch, commit SHA, and which wrapper checks passed.

## Guardrails

- Treat `public/data/stickers.json` as the source of truth for sticker inventory.
- Keep runtime sticker assets vendored in `public/img/stickers/`; do not hotlink third-party image URLs.
- Do not modify card component behavior or CSS effects unless the requested sticker cannot be represented with existing data and effects.
- Do not stage unrelated local changes.
- If the user asks to mirror an existing card exactly, diff all field values against that card before finalizing.
