<script>
  import altArts from "./alternate-arts.json";
  import promos from "./promos.json";
	import Card from "./Card.svelte";

  // data / pokemon props
  export let id = undefined;
  export let name = undefined;
  export let number = undefined;
  export let set = undefined;
  export let types = undefined;
  export let subtypes = undefined;
  export let supertype = undefined;
  export let rarity = undefined;
  export let isReverse = false;
  export let hidden = false;
  export let variant = undefined;
  // Sticker/trading-card metadata (optional)
  export let drop_date = undefined;
  export let description = undefined;
  export let total_prints = undefined;

  // image props
  // New schema:
  // - sticker_img: for sticker cards, the image shown in the art window
  // - card_front_img: full-card front image override (non-sticker cards use this as the face)
  // - card_back_img: back-face image override
  export let sticker_img = undefined;
  export let card_front_img = undefined;
  export let card_back_img = undefined;

  // Legacy props (still supported)
  export let img = undefined;
  export let back = undefined;
  export let foil = undefined;
  export let mask = undefined;

  // context/environment props
  export let showcase = false;
  export let expanded = false;

  const server = import.meta.env.VITE_CDN;
  /**
   * Shiny Vault Card (starts with sv)
   */
  const isShiny = isDefined(number) && number.toLowerCase().startsWith( "sv" );
  /**
   Trainer / Galar Gallery Card (not shiny)
   */
  const isGallery = isDefined(number) && !!number.match(/^[tg]g/i);
  /**
   Alternate Art Card (not shiny / gallery)
   */
  const isAlternate = isDefined(id) && altArts.includes( id ) && !isShiny && !isGallery;
  /**
   Promo Card
   */
  const isPromo = isDefined(set) && set === "swshp";

  // Never mutate exported props (Svelte 5 treats props more strictly).
  // Compute a derived rarity value for CSS selectors and foil/mask lookups.
  let rarityComputed = rarity;
  $: {
    // We standardize on short, lowercase rarity tokens (e.g. "holographic", "steel").
    rarityComputed = isDefined(rarity) ? rarity.toString().trim().toLowerCase() : rarity;

    if (isReverse && isDefined(rarityComputed)) {
      rarityComputed = rarityComputed + " Reverse Holo";
    }

    if (isGallery) {
      if (
        isDefined(rarityComputed) &&
        rarityComputed === "steel" &&
        isDefined(subtypes) &&
        subtypes.includes("VMAX")
      ) {
        rarityComputed = "holofoil-alt-1";
      }
      if (
        isDefined(rarityComputed) &&
        rarityComputed === "steel" &&
        isDefined(subtypes) &&
        subtypes.includes("VSTAR")
      ) {
        rarityComputed = "holofoil-alt-2";
      }
    }

    if (isPromo) {
      if (id === "swshp-SWSH076" || id === "swshp-SWSH077") {
        rarityComputed = "ancient";
      } else if (isDefined(subtypes) && subtypes.includes("V")) {
        rarityComputed = "steel";
      } else if (isDefined(subtypes) && subtypes.includes("V-UNION")) {
        rarityComputed = "steel";
      } else if (isDefined(subtypes) && subtypes.includes("VMAX")) {
        rarityComputed = "holofoil-alt-1";
      } else if (isDefined(subtypes) && subtypes.includes("VSTAR")) {
        rarityComputed = "holofoil-alt-2";
      } else if (isDefined(subtypes) && subtypes.includes("Radiant")) {
        rarityComputed = "radiant";
      }
    }

    // Additional rarity normalization based on special sets.
    const rarityLower = isDefined(rarityComputed) ? rarityComputed.toLowerCase() : "";
    if (isShiny) {
      // Map shiny-vault cards into the proper CSS buckets (short tokens).
      if (rarityLower === "steel") rarityComputed = "shiny-v";
      if (rarityLower === "holofoil-alt-1") rarityComputed = "shiny-vmax";
    }
    if (isAlternate && isDefined(subtypes) && subtypes.includes("VMAX")) {
      rarityComputed = "rare-rainbow-alt-1";
    }
  }


  
  function isDefined (v) {
    return typeof v !== "undefined" && v !== null;
  }
  
  function isArray (v) {
    return typeof v !== "undefined" && Array.isArray(v);
  }

  function cardImage () {
    if ( isDefined( card_front_img ) ) return card_front_img;
    if ( isDefined( img ) ) return img;
    if ( isDefined( sticker_img ) ) return sticker_img;
    if ( isDefined( set ) && isDefined( number ) ) {
      return `https://images.pokemontcg.io/${ set.toLowerCase() }/${ number }_hires.png`;
    }
    return "";
  }

  function cardBackImage () {
    if ( isDefined( card_back_img ) ) return card_back_img;
    return back;
  }
  
  function foilMaskImage ( prop, type = "masks" ) {

    let etch = "holo";
    let style = "reverse";
    let ext = "webp";

    if ( isDefined( prop ) ) {
      if ( prop === false ) {
        return "";
      }
      return prop;
    }

    if( !isDefined( rarity ) || !isDefined( subtypes ) || !isDefined( supertype ) || !isDefined( set ) || !isDefined( number ) ) {
      return "";
    }

    const fRarity = rarityComputed.toLowerCase();
    const fNumber = number.toString().toLowerCase().replace( "swsh", "" ).padStart( 3, "0" );
    const fSet = set.toString().toLowerCase().replace( /(tg|gg|sv)/, "" );

    if ( fRarity === "holofoil" ) {
      style = "swholo";
    }

    if ( fRarity === "galaxy" ) {
      style = "cosmos";
    }

    if ( fRarity === "radiant" ) {
      etch = "etched";
      style = "radiantholo";
    }

    if ( fRarity === "steel" || fRarity === "basic v" ) {
      etch = "holo";
      style = "sunpillar";
    }
    
    if ( fRarity === "holofoil-alt-1" || fRarity === "ultra-rare" || fRarity === "holofoil-alt-2" ) {
      etch = "etched";
      style = "sunpillar";
    }
    
    if ( fRarity === "rare" || fRarity === "rare-rainbow" || fRarity === "rare-rainbow-alt-1" || fRarity === "ancient" ) {
      etch = "etched";
      style = "swsecret";
    }

    if ( isShiny ) {
      etch = "etched";
      style = "sunpillar";

      if ( fRarity === "shiny-vmax" || (fRarity === "holofoil-alt-1" && fNumber.startsWith( "sv" )) ) {
        style = "swsecret";
      }
    }

    if ( isGallery ) {

      etch = "holo";
      style = "rainbow";

      if ( fRarity.includes( "steel" ) || fRarity.includes( "ultra-rare" ) ) {

        etch = "etched";
        style = "sunpillar";

      }

      if ( fRarity.includes( "ancient" ) ) {

        etch = "etched";
        style = "swsecret";

      }

    }

    if ( isAlternate ) {
      etch = "etched";
      if ( subtypes.includes( "VMAX" ) ) {
        style = "swsecret";
      } else {
        style = "sunpillar";
      }
    }

    if ( isPromo ) {

      let promoStyle = promos[ id ];
      if ( promoStyle ) {
        style = promoStyle.style.toLowerCase();
        etch = promoStyle.etch.toLowerCase();
        if ( style === "swholo" ) {
          // rarityComputed handles the CSS rarity buckets; do not mutate props here.
        } else if ( style === "cosmos" ) {
          // rarityComputed handles the CSS rarity buckets; do not mutate props here.
        }
      }

    }

    // If no CDN is configured, fall back to "no mask/foil" so the CSS-only effects still render.
    if (!server) return "";

    return `${ server }/foils/${ fSet }/${ type }/upscaled/${ fNumber }_foil_${ etch }_${ style }_2x.${ ext }`;

  }

  function foilImage () {
    return foilMaskImage( foil, "foils" );
  }

  function maskImage () {
    return foilMaskImage( mask, "masks" );
  }

  const backComputed = cardBackImage();
  const proxy = {
    img: cardImage(),
    ...(isDefined(backComputed) ? { back: backComputed } : {}),
    foil: foilImage(),
    mask: maskImage(),
    sticker_img,
    card_front_img,
    card_back_img,

    id,
    name,
    number,
    set,
    types,
    subtypes,
    supertype,
    rarity: rarityComputed,
    hidden,
    variant,
    drop_date,
    description,
    total_prints,
    showcase,
    expanded

  }

</script>





<Card {...proxy} />
