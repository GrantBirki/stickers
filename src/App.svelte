<script>
  import { onMount } from "svelte";

  import Home from "./pages/Home.svelte";
  import Examples from "./pages/Examples.svelte";
  import ThemeToggle from "./lib/components/ThemeToggle.svelte";

  let path = "/";

  const updatePath = () => {
    path = window.location.pathname || "/";
  };

  const scrollToHash = () => {
    const hash = window.location.hash;
    if (!hash) return;
    const el = document.querySelector(hash);
    if (!el) return;
    // Wait a beat so the page has rendered.
    setTimeout(() => el.scrollIntoView(), 0);
  };

  onMount(() => {
    updatePath();

    const onPop = () => updatePath();
    const onHash = () => scrollToHash();

    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onHash);

    scrollToHash();

    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", onHash);
    };
  });

  $: isExamples = path.startsWith("/examples");
</script>

<div class="app">
  <div class="topbar">
    <a class="topbar__brand" href="/">birki stickers</a>

    <div class="topbar__actions">
      <ThemeToggle />
    </div>
  </div>

  <main class="content">
    {#if isExamples}
      <Examples />
    {:else}
      <Home />
    {/if}
  </main>
</div>

<style>
  .app {
    min-height: 100%;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .topbar__brand {
    font-family: "Roboto Condensed";
    font-weight: 700;
    letter-spacing: 0.02em;
    text-decoration: none;
    color: var(--text);
  }

  .topbar__actions {
    display: flex;
    gap: 8px;
  }

  .content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px 60px;
  }
</style>
