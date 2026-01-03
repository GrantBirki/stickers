<script>
  import { onMount } from "svelte";

  import CardList from "../Cards.svelte";
  import Card from "../lib/components/CardProxy.svelte";

  let isLoading = true;
  let stickers = [];
  let siteConfig = { display_next_card_as_hidden: false };

  const getStickers = async () => {
    try {
      const res = await fetch("/data/stickers.json");
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  };

  const getSiteConfig = async () => {
    try {
      const res = await fetch("/data/site.json");
      if (!res.ok) return { display_next_card_as_hidden: false };
      return await res.json();
    } catch {
      return { display_next_card_as_hidden: false };
    }
  };

  const loadStickers = async () => {
    isLoading = true;
    const [nextStickers, nextConfig] = await Promise.all([getStickers(), getSiteConfig()]);
    siteConfig = nextConfig || { display_next_card_as_hidden: false };
    stickers = nextStickers || [];

    if (siteConfig.display_next_card_as_hidden) {
      stickers = [
        ...stickers,
        {
          id: "stickers-mystery",
          name: "Mystery",
          set: "stickers",
          rarity: "holographic",
          img: "/img/mystery.png",
          hidden: true,
          variant: "mystery"
        }
      ];
    }
    isLoading = false;
  };

  onMount(loadStickers);
</script>

<section class="home">
  <h1>Sticker Drops</h1>
  <p class="home__sub">
    A collection of sticker drops from Birki.
  </p>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each stickers as sticker (sticker.id)}
        <Card
          id={sticker.id}
          name={sticker.name}
          img={sticker.img}
          back={sticker.back}
          number={sticker.number}
          set={sticker.set}
          types={sticker.types}
          supertype={sticker.supertype}
          subtypes={sticker.subtypes}
          rarity={sticker.rarity}
          hidden={sticker.hidden}
          variant={sticker.variant}
          drop_date={sticker.drop_date}
          description={sticker.description}
          total_prints={sticker.total_prints}
        />
      {/each}
    {/if}
  </CardList>
</section>

<style>
  .home {
    padding-top: 20px;
  }

  .home__sub {
    margin: 0 0 20px;
    opacity: 0.85;
  }
</style>
