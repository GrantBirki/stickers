<script>
  import CardList from "../Cards.svelte";
  import Card from "../lib/components/Card.svelte";

  const FACE = "/img/stickers/mike-mike-dms-sticker.png";
  const BACK = "/img/oai_back.png";
  const NAME = "#mike-mike-dms";

  const base = {
    name: NAME,
    card_front_img: FACE,
    card_back_img: BACK,
    supertype: "pokémon",
    subtypes: ["Basic"]
  };

  const withBase = (c) => ({
    ...base,
    ...c
  });

  const showcase = withBase({
    id: "demo-showcase",
    set: "demo",
    number: "0001",
    types: ["Darkness"],
    rarity: "holofoil"
  });

  const groups = [
    {
      anchor: "basic",
      title: "Basic / Non-Holo",
      description:
        "Same local art, different type glows. (No licensed card imagery anywhere on this page.)",
      cards: [
        withBase({
          id: "demo-basic-water",
          set: "demo",
          number: "0002",
          types: ["Water"],
          rarity: "common"
        }),
        withBase({
          id: "demo-basic-fire",
          set: "demo",
          number: "0003",
          types: ["Fire"],
          rarity: "uncommon"
        }),
        withBase({
          id: "demo-basic-psychic",
          set: "demo",
          number: "0004",
          types: ["Psychic"],
          rarity: "common"
        })
      ]
    },
    {
      anchor: "reverse",
      title: "Reverse Holo",
      description: "Reverse holo uses a different shine/glare treatment.",
      cards: [
        withBase({
          id: "demo-reverse-grass",
          set: "demo",
          number: "0005",
          types: ["Grass"],
          rarity: "common reverse holo"
        }),
        withBase({
          id: "demo-reverse-lightning",
          set: "demo",
          number: "0006",
          types: ["Lightning"],
          rarity: "uncommon reverse holo"
        }),
        withBase({
          id: "demo-reverse-darkness",
          set: "demo",
          number: "0007",
          types: ["Darkness"],
          rarity: "common reverse holo"
        })
      ]
    },
    {
      anchor: "holo",
      title: "Holofoil",
      cards: [
        withBase({
          id: "demo-holofoil-basic",
          set: "demo",
          number: "0008",
          types: ["Metal"],
          rarity: "holofoil"
        }),
        withBase({
          id: "demo-holofoil-stage1",
          set: "demo",
          number: "0009",
          types: ["Water"],
          rarity: "holofoil",
          subtypes: ["Stage 1"]
        }),
        withBase({
          id: "demo-holofoil-trainer",
          set: "demo",
          number: "0010",
          types: ["Colorless"],
          rarity: "holofoil",
          supertype: "trainer",
          subtypes: ["Supporter"]
        })
      ]
    },
    {
      anchor: "cosmos",
      title: "Galaxy / Cosmos",
      cards: [
        withBase({
          id: "demo-cosmos-1",
          set: "demo",
          number: "0011",
          types: ["Water"],
          rarity: "galaxy"
        }),
        withBase({
          id: "demo-cosmos-2",
          set: "demo",
          number: "0012",
          types: ["Fire"],
          rarity: "galaxy"
        }),
        withBase({
          id: "demo-cosmos-3",
          set: "demo",
          number: "0013",
          types: ["Psychic"],
          rarity: "galaxy"
        })
      ]
    },
    {
      anchor: "amazing",
      title: "Amazing Rare",
      cards: [
        withBase({
          id: "demo-amazing-1",
          set: "demo",
          number: "0014",
          types: ["Dragon"],
          rarity: "rare"
        }),
        withBase({
          id: "demo-amazing-2",
          set: "demo",
          number: "0015",
          types: ["Fairy"],
          rarity: "rare"
        })
      ]
    },
    {
      anchor: "radiant",
      title: "Radiant",
      cards: [
        withBase({
          id: "demo-radiant-1",
          set: "demo",
          number: "0016",
          types: ["Lightning"],
          rarity: "radiant"
        }),
        withBase({
          id: "demo-radiant-2",
          set: "demo",
          number: "0017",
          types: ["Grass"],
          rarity: "radiant"
        })
      ]
    },
    {
      anchor: "v",
      title: "V / VMAX / VSTAR",
      cards: [
        withBase({
          id: "demo-v",
          set: "demo",
          number: "0018",
          types: ["Darkness"],
          rarity: "steel",
          subtypes: ["V"]
        }),
        withBase({
          id: "demo-spiral-holo",
          set: "demo",
          number: "0018a",
          types: ["Psychic"],
          rarity: "spiral-holographic"
        }),
        withBase({
          id: "demo-v-ultra",
          set: "demo",
          number: "0019",
          types: ["Water"],
          rarity: "ultra-rare",
          subtypes: ["V"]
        }),
        withBase({
          id: "demo-vmax",
          set: "demo",
          number: "0020",
          types: ["Fire"],
          rarity: "holofoil-alt-1",
          subtypes: ["VMAX"]
        }),
        withBase({
          id: "demo-vstar",
          set: "demo",
          number: "0021",
          types: ["Psychic"],
          rarity: "holofoil-alt-2",
          subtypes: ["VSTAR"]
        })
      ]
    },
    {
      anchor: "trainer-gallery",
      title: "Trainer / Galar Gallery",
      cards: [
        withBase({
          id: "demo-tg-holo",
          set: "demo",
          number: "TG01",
          types: ["Water"],
          rarity: "holofoil"
        }),
        withBase({
          id: "demo-tg-v",
          set: "demo",
          number: "TG02",
          types: ["Grass"],
          rarity: "steel",
          subtypes: ["V"]
        }),
        withBase({
          id: "demo-tg-vmax",
          set: "demo",
          number: "TG03",
          types: ["Lightning"],
          rarity: "holofoil-alt-1",
          subtypes: ["VMAX"]
        }),
        withBase({
          id: "demo-tg-secret",
          set: "demo",
          number: "TG04",
          types: ["Darkness"],
          rarity: "ancient"
        })
      ]
    },
    {
      anchor: "rainbow",
      title: "Rainbow / Secret",
      cards: [
        withBase({
          id: "demo-rainbow",
          set: "demo",
          number: "0022",
          types: ["Dragon"],
          rarity: "rare-rainbow"
        }),
        withBase({
          id: "demo-rainbow-alt",
          set: "demo",
          number: "0023",
          types: ["Dragon"],
          rarity: "rare-rainbow-alt-1"
        }),
        withBase({
          id: "demo-secret",
          set: "demo",
          number: "0024",
          types: ["Metal"],
          rarity: "ancient"
        })
      ]
    },
    {
      anchor: "shiny",
      title: "Shiny Vault",
      cards: [
        withBase({
          id: "demo-shiny",
          set: "demo",
          number: "SV01",
          types: ["Grass"],
          rarity: "shiny"
        }),
        withBase({
          id: "demo-shiny-v",
          set: "demo",
          number: "SV02",
          types: ["Lightning"],
          rarity: "shiny-v",
          subtypes: ["V"]
        }),
        withBase({
          id: "demo-shiny-vmax",
          set: "demo",
          number: "SV03",
          types: ["Fire"],
          rarity: "shiny-vmax",
          subtypes: ["VMAX"]
        })
      ]
    }
  ];
</script>

<section class="examples">
  <header class="examples__header">
    <h1>Examples</h1>
    <p class="examples__sub">
      CSS effect playground using a single local image (<code>{NAME}</code>) so we don't ship licensed
      card art.
    </p>

    <div class="showcase">
      <Card {...showcase} showcase={true} />
    </div>
  </header>

  {#each groups as group (group.anchor)}
    <h2 id={"⚓-" + group.anchor}>
      <a href={"#⚓-" + group.anchor}>{group.title}</a>
    </h2>
    {#if group.description}
      <p>{group.description}</p>
    {/if}

    <CardList>
      {#each group.cards as card (card.id)}
        <Card {...card} />
      {/each}
    </CardList>
  {/each}
</section>

<style>
  .examples__header {
    display: grid;
    grid-template-columns: 1fr;
    gap: 18px;
    margin: 0 0 40px;
  }

  .examples__sub {
    margin: 0;
    opacity: 0.85;
  }

  .showcase {
    z-index: 99;
    max-width: min(330px, 80vw);
    margin: 10px auto 0;
  }

  @media screen and (min-width: 800px) {
    .examples__header {
      grid-template-columns: 1fr auto;
      align-items: center;
    }
    .showcase {
      margin: 0;
    }
  }
</style>
