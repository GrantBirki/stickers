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
  // Sticker/trading-card metadata (optional)
  export let drop_number = undefined;
  export let drop_date = undefined;
  export let description = undefined;
  export let total_prints = undefined;

  // image props
  export let img = undefined;
  export let back = undefined;
  export let foil = undefined;
  export let mask = undefined;

  // context/environment props
  export let showcase = false;

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
    rarityComputed = rarity;

    if (isReverse && isDefined(rarityComputed)) {
      rarityComputed = rarityComputed + " Reverse Holo";
    }

    if (isGallery) {
      if (isDefined(rarityComputed) && rarityComputed.startsWith("Trainer Gallery")) {
        rarityComputed = rarityComputed.replace(/Trainer Gallery\\s*/, "");
      }
      if (
        isDefined(rarityComputed) &&
        rarityComputed.includes("Rare Holo V") &&
        isDefined(subtypes) &&
        subtypes.includes("VMAX")
      ) {
        rarityComputed = "Rare Holo VMAX";
      }
      if (
        isDefined(rarityComputed) &&
        rarityComputed.includes("Rare Holo V") &&
        isDefined(subtypes) &&
        subtypes.includes("VSTAR")
      ) {
        rarityComputed = "Rare Holo VSTAR";
      }
    }

    if (isPromo) {
      if (id === "swshp-SWSH076" || id === "swshp-SWSH077") {
        rarityComputed = "Rare Secret";
      } else if (isDefined(subtypes) && subtypes.includes("V")) {
        rarityComputed = "Rare Holo V";
      } else if (isDefined(subtypes) && subtypes.includes("V-UNION")) {
        rarityComputed = "Rare Holo VUNION";
      } else if (isDefined(subtypes) && subtypes.includes("VMAX")) {
        rarityComputed = "Rare Holo VMAX";
      } else if (isDefined(subtypes) && subtypes.includes("VSTAR")) {
        rarityComputed = "Rare Holo VSTAR";
      } else if (isDefined(subtypes) && subtypes.includes("Radiant")) {
        rarityComputed = "Radiant Rare";
      }
    }

    // Additional rarity normalization based on special sets.
    const rarityLower = isDefined(rarityComputed) ? rarityComputed.toLowerCase() : "";
    if (isShiny) {
      // Map shiny-vault cards into the proper CSS buckets.
      if (rarityLower === "rare holo v") rarityComputed = "Rare Shiny V";
      if (rarityLower === "rare holo vmax") rarityComputed = "Rare Shiny VMAX";
    }
    if (isAlternate && isDefined(subtypes) && subtypes.includes("VMAX")) {
      rarityComputed = "Rare Rainbow Alt";
    }
  }


  
  function isDefined (v) {
    return typeof v !== "undefined" && v !== null;
  }
  
  function isArray (v) {
    return typeof v !== "undefined" && Array.isArray(v);
  }

  function cardImage () {
    if ( isDefined( img ) ) {
      return img;
    }
    if ( isDefined( set ) && isDefined( number ) ) {
      return `https://images.pokemontcg.io/${ set.toLowerCase() }/${ number }_hires.png`;
    }
    return "";
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

    if ( fRarity === "rare holo" ) {
      style = "swholo";
    }

    if ( fRarity === "rare holo cosmos" ) {
      style = "cosmos";
    }

    if ( fRarity === "radiant rare" ) {
      etch = "etched";
      style = "radiantholo";
    }

    if ( fRarity === "rare holo v" || fRarity === "rare holo vunion" || fRarity === "basic v" ) {
      etch = "holo";
      style = "sunpillar";
    }
    
    if ( fRarity === "rare holo vmax" || fRarity === "rare ultra" || fRarity === "rare holo vstar" ) {
      etch = "etched";
      style = "sunpillar";
    }
    
    if ( fRarity === "amazing rare" || fRarity === "rare rainbow" || fRarity === "rare secret" ) {
      etch = "etched";
      style = "swsecret";
    }

    if ( isShiny ) {
      etch = "etched";
      style = "sunpillar";

      if ( fRarity === "rare shiny vmax" || (fRarity === "rare holo vmax" && fNumber.startsWith( "sv" )) ) {
        style = "swsecret";
      }
    }

    if ( isGallery ) {

      etch = "holo";
      style = "rainbow";

      if ( fRarity.includes( "rare holo v" ) || fRarity.includes( "rare ultra" ) ) {

        etch = "etched";
        style = "sunpillar";

      }

      if ( fRarity.includes( "rare secret" ) ) {

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

  const proxy = {
    
    img: cardImage(),
    back,
    foil: foilImage(),
    mask: maskImage(),

    id,
    name,
    number,
    set,
    types,
    subtypes,
    supertype,
    rarity: rarityComputed,
    drop_number,
    drop_date,
    description,
    total_prints,
    showcase

  }

</script>





<Card {...proxy} />
