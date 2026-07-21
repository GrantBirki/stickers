import type { CardData } from "./types.ts";

export interface ExampleGroup {
  anchor: string;
  title: string;
  description?: string;
  cards: CardData[];
}

const face = "/img/stickers/mike-mike-dms-sticker.png";
const back = "/img/oai_back.png";
const name = "#mike-mike-dms";

const card = (
  id: string,
  number: string,
  types: string[],
  rarity: string,
  subtypes: string[] = ["Basic"],
  supertype = "pokémon",
): CardData => ({
  id,
  name,
  card_front_img: face,
  card_back_img: back,
  set: "demo",
  number,
  types,
  rarity,
  subtypes,
  supertype,
});

export const showcase = card("demo-showcase", "0001", ["Darkness"], "holofoil");

export const exampleGroups: ExampleGroup[] = [
  {
    anchor: "basic",
    title: "Basic / Non-Holo",
    description: "Same local art, different type glows. (No licensed card imagery anywhere on this page.)",
    cards: [
      card("demo-basic-water", "0002", ["Water"], "common"),
      card("demo-basic-fire", "0003", ["Fire"], "uncommon"),
      card("demo-basic-psychic", "0004", ["Psychic"], "common"),
    ],
  },
  {
    anchor: "reverse",
    title: "Reverse Holo",
    description: "Reverse holo uses a different shine/glare treatment.",
    cards: [
      card("demo-reverse-grass", "0005", ["Grass"], "common reverse holo"),
      card("demo-reverse-lightning", "0006", ["Lightning"], "uncommon reverse holo"),
      card("demo-reverse-darkness", "0007", ["Darkness"], "common reverse holo"),
    ],
  },
  {
    anchor: "holo",
    title: "Holofoil",
    cards: [
      card("demo-holofoil-basic", "0008", ["Metal"], "holofoil"),
      card("demo-holofoil-stage1", "0009", ["Water"], "holofoil", ["Stage 1"]),
      card("demo-holofoil-trainer", "0010", ["Colorless"], "holofoil", ["Supporter"], "trainer"),
    ],
  },
  {
    anchor: "cosmos",
    title: "Galaxy / Cosmos",
    cards: [
      card("demo-cosmos-1", "0011", ["Water"], "galaxy"),
      card("demo-cosmos-2", "0012", ["Fire"], "galaxy"),
      card("demo-cosmos-3", "0013", ["Psychic"], "galaxy"),
    ],
  },
  {
    anchor: "amazing",
    title: "Amazing Rare",
    cards: [
      card("demo-amazing-1", "0014", ["Dragon"], "rare"),
      card("demo-amazing-2", "0015", ["Fairy"], "rare"),
    ],
  },
  {
    anchor: "radiant",
    title: "Radiant",
    cards: [
      card("demo-radiant-1", "0016", ["Lightning"], "radiant"),
      card("demo-radiant-2", "0017", ["Grass"], "radiant"),
    ],
  },
  {
    anchor: "v",
    title: "V / VMAX / VSTAR",
    cards: [
      card("demo-v", "0018", ["Darkness"], "steel", ["V"]),
      card("demo-spiral-holo", "0018a", ["Psychic"], "spiral-holographic"),
      card("demo-v-ultra", "0019", ["Water"], "ultra-rare", ["V"]),
      card("demo-vmax", "0020", ["Fire"], "holofoil-alt-1", ["VMAX"]),
      card("demo-vstar", "0021", ["Psychic"], "holofoil-alt-2", ["VSTAR"]),
    ],
  },
  {
    anchor: "trainer-gallery",
    title: "Trainer / Galar Gallery",
    cards: [
      card("demo-tg-holo", "TG01", ["Water"], "holofoil"),
      card("demo-tg-v", "TG02", ["Grass"], "steel", ["V"]),
      card("demo-tg-vmax", "TG03", ["Lightning"], "holofoil-alt-1", ["VMAX"]),
      card("demo-tg-secret", "TG04", ["Darkness"], "ancient"),
    ],
  },
  {
    anchor: "rainbow",
    title: "Rainbow / Secret",
    cards: [
      card("demo-rainbow", "0022", ["Dragon"], "rare-rainbow"),
      card("demo-rainbow-alt", "0023", ["Dragon"], "rare-rainbow-alt-1"),
      card("demo-secret", "0024", ["Metal"], "ancient"),
    ],
  },
  {
    anchor: "shiny",
    title: "Shiny Vault",
    cards: [
      card("demo-shiny", "SV01", ["Grass"], "shiny"),
      card("demo-shiny-v", "SV02", ["Lightning"], "shiny-v", ["V"]),
      card("demo-shiny-vmax", "SV03", ["Fire"], "shiny-vmax", ["VMAX"]),
    ],
  },
];
