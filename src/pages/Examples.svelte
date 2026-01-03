<script>
  import { onMount } from "svelte";

  import CardList from "../Cards.svelte";
  import Card from "../lib/components/CardProxy.svelte";

  let showcase;
  let basics,
    reverse,
    holos,
    cosmos,
    amazings,
    radiant,
    basicGallery,
    vee,
    veeUltra,
    veeAlt,
    veeMax,
    veeMaxAlt,
    veeStar,
    trainerHolo,
    rainbow,
    gold,
    veeGallery,
    shinyVault;

  let isLoading = true;

  const getCards = async () => {
    const cardFetch = await fetch(`${import.meta.env.BASE_URL}data/cards.json`);
    return await cardFetch.json();
  };

  const loadCards = async () => {
    isLoading = true;
    const cards = await getCards();
    window.cards = cards;

    showcase = cards[0];
    basics = cards.slice(1, 4);
    reverse = [...cards.slice(4, 7), ...cards.slice(70, 76)];
    holos = cards.slice(7, 13);
    cosmos = cards.slice(13, 16);
    amazings = cards.slice(76, 85);
    radiant = cards.slice(16, 19);
    basicGallery = cards.slice(19, 22);
    vee = cards.slice(22, 25);
    veeUltra = cards.slice(25, 28);
    veeAlt = cards.slice(28, 34);
    veeMax = cards.slice(37, 40);
    veeMaxAlt = cards.slice(40, 43);
    veeStar = cards.slice(43, 46);
    trainerHolo = cards.slice(46, 52);
    rainbow = cards.slice(52, 58);
    gold = cards.slice(58, 64);
    veeGallery = cards.slice(64, 70);
    shinyVault = cards.slice(85, 91);

    isLoading = false;
  };

  onMount(loadCards);
</script>

<section class="examples">
  <header class="examples__header">
    <h1>Examples</h1>
    <p class="examples__sub">
      Legacy Pokemon card effect demos (moved off the homepage).
    </p>

    <div class="showcase">
      {#if !showcase}
        loading...
      {:else}
        <Card
          id={showcase.id}
          card_front_img={showcase.card_front_img}
          card_back_img={showcase.card_back_img}
          name={showcase.name}
          set={showcase.set}
          number={showcase.number}
          types={showcase.types}
          supertype={showcase.supertype}
          subtypes={showcase.subtypes}
          rarity={showcase.rarity}
          isReverse={showcase.isReverse}
          showcase={true}
        />
      {/if}
    </div>
  </header>

  <h2 id="⚓-common">
    <a href="#⚓-common">Common &amp; Uncommon</a>
  </h2>
  <p>
    All cards get a 3d rotation with CSS based on cursor position. The basic non-holo cards apply a
    flare/glare effect that follows the mouse.
  </p>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each basics as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
        />
      {/each}
    {/if}
  </CardList>

  <h2 id="⚓-reverse">
    <a href="#⚓-reverse">Reverse Holo non-rares</a>
  </h2>
  <p>
    Reverse holo cards come in many shapes and sizes (trainer, stage1, and different energy types). These
    examples show a few variations.
  </p>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each reverse as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
          isReverse
        />
      {/each}
    {/if}
  </CardList>

  <h2 id="⚓-holo">
    <a href="#⚓-holo">Holofoil Rare</a>
  </h2>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each holos as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
        />
      {/each}
    {/if}
  </CardList>

  <h2 id="⚓-galaxy">
    <a href="#⚓-galaxy">Galaxy/Cosmos Holofoil</a>
  </h2>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each cosmos as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
        />
      {/each}
    {/if}
  </CardList>

  <h2 id="⚓-amazing">
    <a href="#⚓-amazing">Holofoil Amazing Rare</a>
  </h2>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each amazings as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
        />
      {/each}
    {/if}
  </CardList>

  <h2 id="⚓-radiant">
    <a href="#⚓-radiant">Radiant Holofoil</a>
  </h2>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each radiant as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
        />
      {/each}
    {/if}
  </CardList>

  <h2 id="⚓-trainer-gallery-holo">
    <a href="#⚓-trainer-gallery-holo">Trainer Gallery Holofoil</a>
  </h2>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each basicGallery as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
        />
      {/each}
    {/if}
  </CardList>

  <h2 id="⚓-v">
    <a href="#⚓-v">Pokemon V</a>
  </h2>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each vee as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
        />
      {/each}
    {/if}
  </CardList>

  <h2 id="⚓-v-full-art">
    <a href="#⚓-v-full-art">Pokemon V (Full Art)</a>
  </h2>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each veeUltra as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
        />
      {/each}
    {/if}
  </CardList>

  <h2 id="⚓-v-alternate-art">
    <a href="#⚓-v-alternate-art">Pokemon V (Alternate Art)</a>
  </h2>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each veeAlt as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
        />
      {/each}
    {/if}
  </CardList>

  <h2 id="⚓-v-max">
    <a href="#⚓-v-max">VMax</a>
  </h2>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each veeMax as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
        />
      {/each}
    {/if}
  </CardList>

  <h2 id="⚓-v-max-alternate">
    <a href="#⚓-v-max-alternate">VMax (Alternate/Rainbow)</a>
  </h2>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each veeMaxAlt as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
        />
      {/each}
    {/if}
  </CardList>

  <h2 id="⚓-v-star">
    <a href="#⚓-v-star">VStar</a>
  </h2>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each veeStar as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
        />
      {/each}
    {/if}
  </CardList>

  <h2 id="⚓-trainers">
    <a href="#⚓-trainers">Trainer Full Art</a>
  </h2>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each trainerHolo as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
        />
      {/each}
    {/if}
  </CardList>

  <h2 id="⚓-rainbow">
    <a href="#⚓-rainbow">Rainbow</a>
  </h2>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each rainbow as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
        />
      {/each}
    {/if}
  </CardList>

  <h2 id="⚓-gold">
    <a href="#⚓-gold">Gold</a>
  </h2>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each gold as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
        />
      {/each}
    {/if}
  </CardList>

  <h2 id="⚓-v-gallery">
    <a href="#⚓-v-gallery">Trainer / Galar Gallery V</a>
  </h2>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each veeGallery as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
        />
      {/each}
    {/if}
  </CardList>

  <h2 id="⚓-shiny">
    <a href="#⚓-shiny">Shiny Vault</a>
  </h2>

  <CardList>
    {#if isLoading}
      loading...
    {:else}
      {#each shinyVault as card (card.id)}
        <Card
          id={card.id}
          card_front_img={card.card_front_img}
          card_back_img={card.card_back_img}
          name={card.name}
          number={card.number}
          set={card.set}
          types={card.types}
          supertype={card.supertype}
          subtypes={card.subtypes}
          rarity={card.rarity}
        />
      {/each}
    {/if}
  </CardList>
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
