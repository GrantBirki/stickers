<script lang="ts">
  import { onMount } from "svelte";

  import Card from "../lib/components/Card.svelte";
  import {
    baseSlugFromStickerId,
    fullSlugFromStickerId,
    normalizePathSlug,
  } from "../lib/helpers/stickerSlugs.ts";
  import type { CardData } from "../lib/types.ts";

  export let slug = "";

  let sticker: CardData | null = null;

  const loadSticker = async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}data/stickers.json`);
      if (!res.ok) return null;
      const value: unknown = await res.json();
      const list = Array.isArray(value) ? value as CardData[] : [];
      const target = normalizePathSlug(slug);
      return (
        (list || []).find((item) => baseSlugFromStickerId(item?.id) === target) ||
        (list || []).find((item) => fullSlugFromStickerId(item?.id) === target) ||
        null
      );
    } catch {
      return null;
    }
  };

  onMount(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    (async () => {
      sticker = await loadSticker();
    })();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  });
</script>

{#if sticker}
  <div class="inspect">
    <Card
      id={sticker.id}
      name={sticker.name}
      set={sticker.set}
      number={sticker.number}
      rarity={sticker.rarity}
      variant={sticker.variant}
      hidden={sticker.hidden}
      drop_date={sticker.drop_date}
      description={sticker.description}
      total_prints={sticker.total_prints}
      sticker_img={sticker.sticker_img}
      card_front_img={sticker.card_front_img}
      card_back_img={sticker.card_back_img}
      priority={true}
      flip_on_click={true}
    />
  </div>
{/if}

<style>
  :global(html),
  :global(body) {
    height: 100%;
  }

  .inspect {
    --inspect-card-width: min(92vw, calc(86vh * var(--card-aspect)), 620px);
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: min(4vmin, 44px);
    margin: 0;
  }

  /* Fit the card to the viewport immediately (no popover scaling needed). */
  .inspect :global(.card) {
    width: var(--inspect-card-width);
  }

  /* Size text with the card, including on short landscape viewports. Reserve
     enough space below square artwork for the date and wrapped description. */
  .inspect :global(.card[data-set="stickers"]) {
    --sticker-title-size: calc(var(--inspect-card-width) * 0.072);
    --sticker-desc-size: calc(var(--inspect-card-width) * 0.045);
    --sticker-date-size: calc(var(--inspect-card-width) * 0.038);
    --sticker-prints-size: calc(var(--inspect-card-width) * 0.038);
    --sticker-card-number-size: calc(var(--inspect-card-width) * 0.042);
    --sticker-meta-weight: 600;
    --sticker-art-bottom: 31%;
  }

  .inspect :global(.sticker__desc) {
    white-space: normal;
    overflow-wrap: anywhere;
  }
</style>
