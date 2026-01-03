<script>
  import { onMount } from "svelte";

  import CardList from "../Cards.svelte";
  import Card from "../lib/components/CardProxy.svelte";

  let isLoading = true;
  let stickers = [];

  const getStickers = async () => {
    try {
      const res = await fetch("/data/stickers.json");
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  };

  const loadStickers = async () => {
    isLoading = true;
    stickers = await getStickers();
    isLoading = false;
  };

  onMount(loadStickers);
</script>

<section class="home">
  <h1>Stickers</h1>
  <p class="home__sub">
    Holographic “trading cards” for my sticker drops.
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
