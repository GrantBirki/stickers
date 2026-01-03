# stickers

The website for stickers.birki.io - Grant's collection of sticker drops!

## Dev

- `npm install`
- `npm run dev`
- `npm run build`

## Adding A Sticker Card

1) Put the sticker image in `public/img/stickers/` (PNG works great).
2) (Optional) Put a custom back image somewhere under `public/img/` (for example `public/img/backs/`).
3) Add an entry to `public/data/stickers.json`.

Example:

```json
{
  "id": "stickers-my-sticker-001",
  "name": "My Sticker",
  "set": "stickers",
  "number": "0001",
  "rarity": "holographic",
  "img": "/img/stickers/my-sticker.png",
  "back": "/img/backs/my-back.png",
  "drop_date": "2026-01-02",
  "description": "Short description",
  "total_prints": 10
}
```

Notes:
- `img` and `back` are public paths (they should start with `/img/...`).
- `back` is optional; if omitted we fall back to the default card back image.

## Rarity Tokens

This project uses short rarity tokens everywhere (no long rarity names with spaces).
Set these on the `rarity` field in `public/data/stickers.json` or `public/data/cards.json`.

- `holofoil` -> `Rare Holo`
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

Each card can optionally set its own back image with the `back` field (example above).

If `back` is not provided, the card uses the default back image set in `src/lib/components/Card.svelte`.

## Examples

Pokemon example cards live in `public/data/cards.json` and render on `/examples/`.

## Acknowledgements

https://github.com/simeydotme/pokemon-cards-css

