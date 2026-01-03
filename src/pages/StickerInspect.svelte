<script>
  import { onMount } from "svelte";

  import Card from "../lib/components/Card.svelte";

  export let slug = "";

  let sticker = null;

  const baseSlugFromStickerId = (id) => {
    if (!id) return "";
    return id.toString().replace(/^stickers-/, "").replace(/-\d+$/, "");
  };

  const fullSlugFromStickerId = (id) => {
    if (!id) return "";
    return id.toString().replace(/^stickers-/, "");
  };

  const normalizeSlug = (s) => (s ?? "").toString().replace(/^\/+/, "").replace(/\/+$/, "");

  const loadSticker = async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}data/stickers.json`);
      if (!res.ok) return null;
      const list = await res.json();
      const target = normalizeSlug(slug);
      return (
        (list || []).find((item) => baseSlugFromStickerId(item?.id) === target) ||
        (list || []).find((item) => fullSlugFromStickerId(item?.id) === target) ||
        null
      );
    } catch {
      return null;
    }
  };

  onMount(async () => {
    // This view is intentionally dark-only.
    document.documentElement.dataset.theme = "dark";

    sticker = await loadSticker();
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
      flip_on_click={true}
    />
  </div>
{/if}

<style>
  :global(html) {
    /* Make rem-based typography feel right when the card is shown large. */
    font-size: clamp(16px, 1.1vw + 12px, 20px);
  }

  :global(html),
  :global(body) {
    height: 100%;
  }

  /* No scrollbars / extra chrome for this "inspection" page. */
  :global(body) {
    overflow: hidden;
  }

  .inspect {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: clamp(16px, 4vmin, 44px);
    margin: 0;
  }

  /* Fit the card to the viewport immediately (no popover scaling needed). */
  .inspect :global(.card) {
    width: min(92vw, calc(86vh * var(--card-aspect)), 620px);
  }
</style>
