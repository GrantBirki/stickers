<script>
  import { onMount } from "svelte";

  import CardList from "../Cards.svelte";
  import Card from "../lib/components/CardProxy.svelte";

  let isLoading = true;
  let stickers = [];
  let siteConfig = { display_next_card_as_hidden: false };

  const getStickers = async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}data/stickers.json`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  };

  const getSiteConfig = async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}data/site.json`);
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
          card_front_img: "/img/mystery.png",
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
  <p class="home__sub home__sub--slack">
    Do you work with Birki? Follow the <code class="inline-code">#birki-sticker-drops</code> channel
    in Slack to catch a limited edition sticker drop!
  </p>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each stickers as sticker (sticker.id)}
        <Card
          id={sticker.id}
          name={sticker.name}
          sticker_img={sticker.sticker_img}
          card_front_img={sticker.card_front_img}
          card_back_img={sticker.card_back_img}
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

  .home__sub--slack {
    margin-top: -10px;
  }

  /* GitHub-esque inline code pill that stays readable in both themes. */
  .inline-code {
    font-family: ui-monospace, SFMono-Regular, SFMono, Menlo, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace;
    font-size: 0.92em;
    padding: 0.12em 0.4em;
    border-radius: 6px;
    background: hsla(220, 14%, 96%, 1);
    border: 1px solid hsla(220, 14%, 78%, 0.9);
    color: var(--text);
    white-space: nowrap;
  }

  :global(:root[data-theme="dark"]) .inline-code {
    background: hsla(215, 28%, 17%, 1);
    border-color: hsla(215, 20%, 55%, 0.35);
  }
</style>
