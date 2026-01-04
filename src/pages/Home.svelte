<script>
  import { onMount } from "svelte";

  import CardList from "../Cards.svelte";
  import Card from "../lib/components/Card.svelte";
  import { activeStickerId } from "../lib/stores/activeStickerId.js";

  let isLoading = true;
  let stickers = [];
  let stickerSlugsById = {};
  let siteConfig = { display_next_card_as_hidden: false };

  const baseSlugFromStickerId = (id) =>
    (id ?? "").toString().replace(/^stickers-/, "").replace(/-\d+$/, "");
  const fullSlugFromStickerId = (id) => (id ?? "").toString().replace(/^stickers-/, "");

  const buildSlugMap = (list) => {
    const used = Object.create(null);
    const map = {};
    for (const item of list || []) {
      const base = baseSlugFromStickerId(item?.id);
      const full = fullSlugFromStickerId(item?.id);
      const slug = !base ? full : used[base] ? full : base;
      if (!slug || !item?.id) continue;
      used[slug] = true;
      map[item.id] = slug;
    }
    return map;
  };

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
    const baseStickers = nextStickers || [];
    stickerSlugsById = buildSlugMap(baseStickers);
    stickers = baseStickers;

    if (siteConfig.display_next_card_as_hidden) {
      stickers = [
        ...stickers,
        {
          id: "stickers-mystery",
          name: "Mystery",
          set: "stickers",
          rarity: "holographic",
          card_front_img: "/img/mystery.png",
          card_back_img: "/img/card_front_texture_gray.png",
          hidden: true,
          variant: "mystery"
        }
      ];
    }
    isLoading = false;
  };

  onMount(loadStickers);

  $: activeSlug = stickerSlugsById[$activeStickerId];
  $: inspectHref = activeSlug ? `/stickers/${activeSlug}` : "";

  const onInspectClick = (e) => {
    if (!inspectHref) return;
    // Let users open in a new tab/window with modifier keys.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    window.history.pushState({}, "", inspectHref);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
</script>

<section class="home">
  <header class="home__header">
    <div class="home__eyebrow">Limited Editions</div>
    <h1 class="home__title">Sticker Drops</h1>
    <p class="home__desc">A collection of sticker drops from Grant.</p>
    <p class="home__cta">
      <span class="home__cta-lead">Do you work with Grant?</span>
      Follow <code class="inline-code">#birki-sticker-drops</code> in Slack to catch the next
      sticker drop.
    </p>
    <div class="home__rule" aria-hidden="true"></div>
  </header>

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

  {#if activeSlug}
    <a
      class="inspect-fab"
      href={inspectHref}
      on:click={onInspectClick}
      data-inspect-button="true"
      aria-label="Open inspect view"
    >
      <svg
        class="inspect-fab__icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M9 9h-4V5h4" />
        <path d="M15 9h4V5h-4" />
        <path d="M9 15h-4v4h4" />
        <path d="M15 15h4v4h-4" />
      </svg>
      <span class="inspect-fab__label">inspect</span>
    </a>
  {/if}
</section>

<style>
  .home {
    padding-top: clamp(22px, 4vw, 46px);
  }

  .home__header {
    max-width: 68ch;
    margin-bottom: clamp(26px, 4vw, 46px);
  }

  .home__eyebrow {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--muted) 72%, var(--bg) 28%);
    margin: 0 0 10px;
  }

  .home__title {
    margin: 0;
    font-size: clamp(2.3rem, 4.8vw, 3.35rem);
    font-weight: 820;
    font-stretch: 100%;
    font-optical-sizing: none;
    font-variation-settings: "wght" 820, "wdth" 100, "opsz" var(--opsz-heading);
    letter-spacing: -0.02em;
    line-height: 1.02;
  }

  .home__desc {
    margin: clamp(12px, 1.6vw, 16px) 0 0;
    font-size: clamp(1.05rem, 1.5vw, 1.22rem);
    line-height: 1.45;
    color: var(--muted);
    max-width: 56ch;
  }

  /* Slack callout: distinct, but quiet. */
  .home__cta {
    margin: clamp(14px, 1.9vw, 18px) 0 0;
    display: block;
    padding-left: 14px;
    border-left: 1px solid var(--border);
    font-size: clamp(1rem, 1.25vw, 1.12rem);
    line-height: 1.55;
    color: color-mix(in srgb, var(--text) 86%, var(--bg) 14%);
  }

  .home__cta-lead {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--text) 70%, var(--bg) 30%);
    display: inline-block;
    margin-right: 0.45rem;
    vertical-align: baseline;
  }

  /* GitHub-esque inline code pill that stays readable in both themes. */
  .inline-code {
    font-family: var(--font-mono);
    font-size: 0.92em;
    padding: 0.18em 0.44em;
    border-radius: 6px;
    background: color-mix(in srgb, var(--bg) 88%, var(--text) 12%);
    border: 1px solid var(--border);
    color: var(--text);
    white-space: nowrap;
    display: inline-block;
    line-height: 1.1;
    vertical-align: baseline;
  }

  .home__rule {
    height: 1px;
    margin-top: clamp(18px, 3.2vw, 30px);
    background: linear-gradient(to right, var(--border), transparent);
  }

  /* "Liquid glass" floating action button shown when a homepage card is expanded. */
  .inspect-fab {
    position: fixed;
    right: calc(18px + env(safe-area-inset-right, 0px));
    bottom: calc(18px + env(safe-area-inset-bottom, 0px));
    z-index: 9999;

    display: inline-flex;
    align-items: center;
    gap: 10px;

    border: 1px solid color-mix(in srgb, var(--border) 65%, transparent);
    border-radius: 999px;
    padding: 12px 14px;

    background: linear-gradient(135deg, var(--surface), var(--surface-2));
    box-shadow:
      0 14px 44px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.18);

    color: var(--text);
    text-decoration: none;
    user-select: none;
    cursor: pointer;

    -webkit-backdrop-filter: blur(16px) saturate(170%);
    backdrop-filter: blur(16px) saturate(170%);

    transition:
      transform 160ms ease,
      box-shadow 160ms ease,
      border-color 160ms ease;
  }

  .inspect-fab::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background: radial-gradient(
        120% 120% at 20% 10%,
        rgba(255, 255, 255, 0.28),
        transparent 55%
      ),
      radial-gradient(120% 120% at 90% 80%, rgba(80, 220, 255, 0.18), transparent 60%);
    opacity: 0.9;
    mix-blend-mode: screen;
  }

  .inspect-fab:visited {
    color: var(--text);
  }

  .inspect-fab:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--primary) 35%, var(--border));
    box-shadow:
      0 18px 56px rgba(0, 0, 0, 0.42),
      inset 0 1px 0 rgba(255, 255, 255, 0.22);
    color: var(--text);
  }

  .inspect-fab:active {
    transform: translateY(0);
  }

  .inspect-fab:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--primary) 60%, transparent);
    outline-offset: 3px;
  }

  .inspect-fab__icon {
    width: 18px;
    height: 18px;
    opacity: 0.92;
  }

  .inspect-fab__label {
    position: relative;
    font-size: 0.86rem;
    letter-spacing: 0.02em;
    text-transform: lowercase;
    color: color-mix(in srgb, var(--text) 92%, rgba(0, 0, 0, 0));
  }

  @media (prefers-reduced-motion: reduce) {
    .inspect-fab {
      transition: none;
    }
  }

  @supports not (backdrop-filter: blur(1px)) {
    .inspect-fab {
      /* Fallback: slightly more opaque without blur support. */
      background: color-mix(in srgb, var(--surface) 92%, transparent);
    }
  }
</style>
