<script>
  import { spring } from "svelte/motion";
  import { onMount } from "svelte";
  import { activeCard } from "../stores/activeCard.js";
  import { orientation, resetBaseOrientation } from "../stores/orientation.js";
  import { clamp, round, adjust } from "../helpers/Math.js";

  // card metadata props
  export let id = "";
  export let name = "";
  export let number = "";
  export let set = "";
  export let types = "";
  export let subtypes = "basic";
  export let supertype = "pokémon";
  export let rarity = "common";
  export let hidden = false;
  export let variant = "";

  // image props
  export let img = "";
  export let back = "/img/oai_back.png";
  export let foil = "";
  export let mask = "";

  // New schema (optional; `img`/`back` still work for legacy callers):
  // - sticker_img: image shown in the sticker art window (set === "stickers")
  // - card_front_img: full-card front image override (used for non-sticker cards and mystery cards)
  // - card_back_img: back-face image override
  export let sticker_img = "";
  export let card_front_img = "";
  export let card_back_img = "";

  // context/environment props
  export let showcase = false;
  // If true, force the card into the expanded "popover" state and prevent collapsing.
  export let expanded = false;

  // Sticker/trading-card metadata (optional)
  export let drop_date = "";
  export let description = "";
  export let total_prints = "";

  const randomSeed = {
    x: Math.random(),
    y: Math.random()
  }

  const cosmosPosition = { 
    x: Math.floor( randomSeed.x * 734 ), 
    y: Math.floor( randomSeed.y * 1280 ) 
  };

  let isTrainerGallery = false;
  let isSquareFront = false;
  let isStickerCard = false;
  let stickerFoilScope = "art"; // "art" | "full"
  let isMysteryCard = false;

  // Sticker-only: which rarities should have a full-card foil (instead of art-window-only).
  const FULL_STICKER_FOILS = new Set([
    "holographic",
    "rare-rainbow",
    "rare-rainbow-alt-1",
    "ancient"
  ]);

  let back_img = back;
  let front_img = "";

  const resolveImgSrc = (src) => {
    if (!src) return "";
    // Absolute/served assets (http(s), /public/*, data URLs) should be used as-is.
    if (src.startsWith("http") || src.startsWith("/") || src.startsWith("data:")) return src;
    // Treat bare relative paths as public-root paths (avoid any remote URL fallbacks).
    const cleaned = src.toString().replace(/^\.\//, "");
    return `/${cleaned}`;
  };

  const cssUrl = (src) => {
    const resolved = resolveImgSrc(src);
    if (!resolved) return "none";
    // Quote to survive URLs with parens/spaces.
    return `url("${resolved}")`;
  };


  let thisCard;
  let repositionTimer;
  let rafId = null;
  let pendingSpringUpdate = null;

  let active = false;
  let interacting = false;
  let firstPop = true;
  let loading = true;
  let isVisible = document.visibilityState === "visible";

  const springInteractSettings = { stiffness: 0.066, damping: 0.25 };
  const springPopoverSettings = { stiffness: 0.033, damping: 0.45 };
  let springRotate = spring({ x: 0, y: 0 }, springInteractSettings);
  let springGlare = spring({ x: 50, y: 50, o: 0 }, springInteractSettings);
  let springBackground = spring({ x: 50, y: 50 }, springInteractSettings);
  let springRotateDelta = spring({ x: 0, y: 0 }, springPopoverSettings);
  let springTranslate = spring({ x: 0, y: 0 }, springPopoverSettings);
  let springScale = spring(1, springPopoverSettings);

  let showcaseInterval;
  let showcaseTimerStart;
  let showcaseTimerEnd;
  let showcaseRunning = showcase;

  const endShowcase = () => {
    if (showcaseRunning) {
      clearTimeout(showcaseTimerEnd);
      clearTimeout(showcaseTimerStart);
      clearInterval(showcaseInterval);
      showcaseRunning = false;
    }
  };

  const interact = (e) => {
    
    endShowcase();

    if (!isVisible) {
      return (interacting = false);
    }
    
    // prevent other background cards being interacted with
    if ($activeCard && $activeCard !== thisCard) {
      return (interacting = false);
    }

    interacting = true;

    if (e.type === "touchmove") {
      e.clientX = e.touches[0].clientX;
      e.clientY = e.touches[0].clientY;
    }

    const $el = e.target;
    const rect = $el.getBoundingClientRect(); // get element's current size/position
    const absolute = {
      x: e.clientX - rect.left, // get mouse position from left
      y: e.clientY - rect.top, // get mouse position from right
    };
    const percent = {
      x: clamp(round((100 / rect.width) * absolute.x)),
      y: clamp(round((100 / rect.height) * absolute.y)),
    };
    const center = {
      x: percent.x - 50,
      y: percent.y - 50,
    };

    // Store the latest interaction data
    pendingSpringUpdate = {
      background: {
        x: adjust(percent.x, 0, 100, 37, 63),
        y: adjust(percent.y, 0, 100, 33, 67),
      },
      rotate: {
        x: round(-(center.x / 3.5)),
        y: round(center.y / 3.5),
      },
      glare: {
        x: round(percent.x),
        y: round(percent.y),
        o: 1,
      }
    };

    // Schedule spring update for next frame if not already scheduled
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (pendingSpringUpdate) {
          updateSprings(
            pendingSpringUpdate.background,
            pendingSpringUpdate.rotate,
            pendingSpringUpdate.glare
          );
          pendingSpringUpdate = null;
        }
        rafId = null;
      });
    }
  };

  const interactEnd = (e, delay = 500) => {
    // Cancel any pending animation frame
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    pendingSpringUpdate = null;

    setTimeout(function () {
      const snapStiff = 0.01;
      const snapDamp = 0.06;
      interacting = false;

      springRotate.stiffness = snapStiff;
      springRotate.damping = snapDamp;
      springRotate.set({ x: 0, y: 0 }, { soft: 1 });

      springGlare.stiffness = snapStiff;
      springGlare.damping = snapDamp;
      springGlare.set({ x: 50, y: 50, o: 0 }, { soft: 1 });

      springBackground.stiffness = snapStiff;
      springBackground.damping = snapDamp;
      springBackground.set({ x: 50, y: 50 }, { soft: 1 });
    }, delay);
  };

  const activate = (e) => {
    if (expanded) {
      $activeCard = thisCard;
      resetBaseOrientation();
      return;
    }
    if ($activeCard && $activeCard === thisCard) {
      $activeCard = undefined;
    } else {
      $activeCard = thisCard;
      resetBaseOrientation();
    }
  };

  const deactivate = (e) => {
    if (expanded) return;
    interactEnd();
    $activeCard = undefined;
  };

  const reposition = (e) => {
    clearTimeout(repositionTimer);
    repositionTimer = setTimeout(() => {
      if ($activeCard && $activeCard === thisCard) {
        setCenter();
      }
    }, 300);
  };

  const setCenter = () => {
    const rect = thisCard.getBoundingClientRect(); // get element's size/position
    const view = document.documentElement; // get window/viewport size

    const delta = {
      x: round(view.clientWidth / 2 - rect.x - rect.width / 2),
      y: round(view.clientHeight / 2 - rect.y - rect.height / 2),
    };
    springTranslate.set({
      x: delta.x,
      y: delta.y,
    });
  };

  const popover = () => {
    const rect = thisCard.getBoundingClientRect(); // get element's size/position
    let delay = 100;
    let scaleW = (window.innerWidth / rect.width) * 0.9;
    let scaleH = (window.innerHeight / rect.height) * 0.9;
    let scaleF = 1.75;
    setCenter();
    if (firstPop) {
      if (!expanded) {
        delay = 1000;
        springRotateDelta.set({
          x: 360,
          y: 0,
        });
      }
    }
    firstPop = false;
    springScale.set(Math.min(scaleW, scaleH, scaleF));
    interactEnd(null, delay);
  };

  const retreat = () => {
    springScale.set(1, { soft: true });
    springTranslate.set({ x: 0, y: 0 }, { soft: true });
    springRotateDelta.set({ x: 0, y: 0 }, { soft: true });
    interactEnd(null, 100);
  };

  const reset = () => {
    interactEnd(null, 0);
    springScale.set(1, { hard: true });
    springTranslate.set({ x: 0, y: 0 }, { hard: true });
    springRotateDelta.set({ x: 0, y: 0 }, { hard: true });
    springRotate.set({ x: 0, y: 0 }, { hard: true });
  };

  $: {
    if ($activeCard && $activeCard === thisCard) {
      popover();
      active = true;
    } else {
      retreat();
      active = false;
    }
  }


  let foilStyles = ``;
  const staticStyles = `
    --seedx: ${randomSeed.x};
    --seedy: ${randomSeed.y};
    --cosmosbg: ${cosmosPosition.x}px ${cosmosPosition.y}px;
  `;
  let frontOverrideStyles = "";
  $: dynamicStyles = `
    --pointer-x: ${$springGlare.x}%;
    --pointer-y: ${$springGlare.y}%;
    --pointer-from-center: ${ 
      clamp( Math.sqrt( 
        ($springGlare.y - 50) * ($springGlare.y - 50) + 
        ($springGlare.x - 50) * ($springGlare.x - 50) 
      ) / 50, 0, 1) };
    --pointer-from-top: ${$springGlare.y / 100};
    --pointer-from-left: ${$springGlare.x / 100};
    --card-opacity: ${$springGlare.o};
    --rotate-x: ${$springRotate.x + $springRotateDelta.x}deg;
    --rotate-y: ${$springRotate.y + $springRotateDelta.y}deg;
    --background-x: ${$springBackground.x}%;
    --background-y: ${$springBackground.y}%;
    --card-scale: ${$springScale};
    --translate-x: ${$springTranslate.x}px;
    --translate-y: ${$springTranslate.y}px;
	`;

  const normalize = (v) => (v ?? "").toString().toLowerCase();
  const normalizeList = (v) =>
    Array.isArray(v) ? v.join(" ").toLowerCase() : normalize(v);

  const formatDropDate = (v) => {
    if (!v) return "";
    // Support `YYYY-MM-DD` -> `YYYY/MM/DD` for a more card-like look.
    return v.toString().trim().replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$1/$2/$3");
  };

  // Never mutate exported props (Svelte 5 treats props more strictly).
  let rarityAttr = "common";
  let supertypeAttr = "pokémon";
  let numberAttr = "";
  let setAttr = "";
  let typesAttr = "";
  let subtypesAttr = "basic";

  $: {
    rarityAttr = normalize(rarity) || "common";
    supertypeAttr = normalize(supertype) || "pokémon";
    numberAttr = normalize(number);
    setAttr = normalize(set);
    typesAttr = normalizeList(types);
    subtypesAttr = normalizeList(subtypes) || "basic";

    isTrainerGallery =
      !!numberAttr.match(/^[tg]g/i) ||
      id === "swshp-SWSH076" ||
      id === "swshp-SWSH077";

    isStickerCard = setAttr === "stickers";
    isMysteryCard = isStickerCard && variant === "mystery";
    stickerFoilScope =
      isStickerCard && FULL_STICKER_FOILS.has(rarityAttr) ? "full" : "art";
  }

  const orientate = (e) => {

    const x = e.relative.gamma;
    const y = e.relative.beta;
    const limit = { x: 16, y: 18 };

    const degrees = { 
      x: clamp(x, -limit.x, limit.x), 
      y: clamp(y, -limit.y, limit.y) 
    };

    updateSprings({
      x: adjust(degrees.x, -limit.x, limit.x, 37, 63),
      y: adjust(degrees.y, -limit.y, limit.y, 33, 67),
    },{
      x: round(degrees.x * -1),
      y: round(degrees.y),
    },{
      x: adjust(degrees.x, -limit.x, limit.x, 0, 100),
      y: adjust(degrees.y, -limit.y, limit.y, 0, 100),
      o: 1,
    });

  };

  // Derive which images to use based on card type.
  $: {
    // For sticker cards, `sticker_img` (or legacy `img`) is the art-window image.
    // For non-sticker cards, `card_front_img` (or legacy `img`) is the full face image.
    const stickerFace = resolveImgSrc(sticker_img || img);
    const cardFace = resolveImgSrc(card_front_img || img);

    front_img = isStickerCard && !isMysteryCard ? stickerFace : cardFace;
    back_img = resolveImgSrc(card_back_img || back);

  // Optional front background override for sticker cards (lets you swap the face image).
  // We intentionally do NOT set a "none" fallback here; CSS provides a default face.
  frontOverrideStyles =
      isStickerCard && !isMysteryCard && card_front_img
        ? `--card-front-img: ${cssUrl(card_front_img)}; --front-texture-opacity: 0;`
        : ``;
  }

  const updateSprings = ( background, rotate, glare ) => {

    springBackground.stiffness = springInteractSettings.stiffness;
    springBackground.damping = springInteractSettings.damping;
    springRotate.stiffness = springInteractSettings.stiffness;
    springRotate.damping = springInteractSettings.damping;
    springGlare.stiffness = springInteractSettings.stiffness;
    springGlare.damping = springInteractSettings.damping;

    springBackground.set(background);
    springRotate.set(rotate);
    springGlare.set(glare);

  }

  $: {
    if ($activeCard && $activeCard === thisCard) {
      interacting = true;
      orientate($orientation);
    }
  }

  document.addEventListener("visibilitychange", (e) => {
    isVisible = document.visibilityState === "visible";
    endShowcase();
    reset();
  });

  const imageLoader = (e) => {
    loading = false;

    // Detect if the provided face image is roughly square (e.g. a sticker),
    // so we can apply nicer "centered with padding" layout rules.
    const imgEl = e?.currentTarget;
    if (imgEl?.naturalWidth && imgEl?.naturalHeight) {
      const ratio = imgEl.naturalWidth / imgEl.naturalHeight;
      isSquareFront = Math.abs(ratio - 1) < 0.05;
    }

    if ( mask || foil ) {
      foilStyles = `
    --mask: url(${mask});
    --foil: url(${foil});
      `;
    }
  };

  onMount(() => {

    if (expanded) {
      $activeCard = thisCard;
      resetBaseOrientation();
      // Ensure centering happens once layout has settled.
      setTimeout(() => {
        if ($activeCard && $activeCard === thisCard) setCenter();
      }, 0);
    }

    // Images are derived reactively; no work needed here.

    // run a cute little animation on load
    // for showcase card
    if (showcase && isVisible) {
      let showTimer;
      const s = 0.02;
      const d = 0.5;
      let r = 0;
      showcaseTimerStart = setTimeout(() => {
        interacting = true;
        active = true;
        springRotate.stiffness = s;
        springRotate.damping = d;
        springGlare.stiffness = s;
        springGlare.damping = d;
        springBackground.stiffness = s;
        springBackground.damping = d;
        if (isVisible) {
          showcaseInterval = setInterval(function () {
            r += 0.05;
            springRotate.set({ x: Math.sin(r) * 25, y: Math.cos(r) * 25 });
            springGlare.set({
              x: 55 + Math.sin(r) * 55,
              y: 55 + Math.cos(r) * 55,
              o: 0.8,
            });
            springBackground.set({
              x: 20 + Math.sin(r) * 20,
              y: 20 + Math.cos(r) * 20,
            });
          }, 20);
          showcaseTimerEnd = setTimeout(() => {
            clearInterval(showcaseInterval);
            interactEnd(null, 0);
          }, 4000);
        } else {
          interacting = false;
          active = false;
          return;
        }
      }, 2000);
    }
  });
</script>

<svelte:window on:scroll={reposition} />

<div
	  class="card {typesAttr} / interactive / "
	  class:active
	  class:interacting
	  class:loading
		  class:masked={!!mask}
		  data-front-shape={isSquareFront ? "square" : "rect"}
		  data-sticker-foil={isStickerCard ? stickerFoilScope : undefined}
		  data-number={numberAttr}
		  data-set={setAttr}
		  data-subtypes={subtypesAttr}
		  data-supertype={supertypeAttr}
		  data-rarity={rarityAttr}
		  data-hidden={hidden ? "true" : undefined}
		  data-variant={variant ? variant : undefined}
	  data-trainer-gallery={isTrainerGallery}
	  style={dynamicStyles}
	  bind:this={thisCard}
	>
  <div 
    class="card__translater">
    <button
      class="card__rotator"
      on:click={activate}
      on:pointermove={interact}
      on:mouseout={interactEnd}
      on:blur={deactivate}
      aria-label="Expand card: {name}."
      tabindex="0"
      >
      <img
        class="card__back"
        src={back_img}
        alt="The back of a trading card"
        loading="lazy"
        width="660"
        height="921"
      />
	      <div class="card__front" 
	        style={ staticStyles + frontOverrideStyles + foilStyles }>
	        {#if isStickerCard}
	          <div class="sticker__bg" aria-hidden="true"></div>

	          {#if isMysteryCard}
	            <img
	              class="card__face mystery__face"
	              src={front_img}
	              alt="A mystery card"
	              on:load={imageLoader}
	              loading="lazy"
	              width="660"
	              height="921"
	            />
	          {:else}
	            {#if stickerFoilScope === "full"}
	              <div class="card__shine"></div>
	              <div class="card__glare"></div>
	            {/if}

	            <div class="sticker__header">
	              <div class="sticker__title">{name}</div>
	            </div>

	            <div class="sticker__art">
	              <div class="sticker__art-bg" aria-hidden="true"></div>
	              <div class="sticker__art-inner">
	                <img
	                  class="card__face sticker__face"
	                  src={front_img}
	                  alt="Front image for the {name} card"
	                  on:load={imageLoader}
	                  loading="lazy"
	                  width="660"
	                  height="921"
	                />
	              </div>
	              <div class="sticker__frame" aria-hidden="true"></div>
	              {#if stickerFoilScope === "art"}
	                <div class="card__shine"></div>
	                <div class="card__glare"></div>
	              {/if}
	            </div>

	            <div class="sticker__meta">
	              {#if drop_date}
	                <div class="sticker__date">{formatDropDate(drop_date)}</div>
	              {/if}
	              {#if description}
	                <div class="sticker__desc">{description}</div>
	              {/if}
	            </div>

	            <div class="sticker__footer">
	              {#if total_prints}
	                <div class="sticker__prints">Total prints: {total_prints}</div>
	              {/if}
	              {#if number}
	                <div class="sticker__card-number">{number}</div>
	              {/if}
	            </div>
	          {/if}
	        {:else}
          <img
            class="card__face"
            src={front_img}
            alt="Front image for the {name} card"
            on:load={imageLoader}
            loading="lazy"
            width="660"
            height="921"
          />
          <div class="card__shine"></div>
          <div class="card__glare"></div>
        {/if}
      </div>
    </button>
  </div>
</div>

<style>

  :root {
    --pointer-x: 50%;
    --pointer-y: 50%;
    --card-scale: 1;
    --card-opacity: 0;
    --translate-x: 0px;
    --translate-y: 0px;
    --rotate-x: 0deg;
    --rotate-y: 0deg;
    --background-x: var(--pointer-x);
    --background-y: var(--pointer-y);
    --pointer-from-center: 0;    
    --pointer-from-top: var(--pointer-from-center);
    --pointer-from-left: var(--pointer-from-center);
  }

</style>
