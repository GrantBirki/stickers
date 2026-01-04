<script>
  import { onMount } from "svelte";

  import Home from "./pages/Home.svelte";
  import Examples from "./pages/Examples.svelte";
  import StickerInspect from "./pages/StickerInspect.svelte";
  import StaticPage from "./pages/StaticPage.svelte";
  import ThemeToggle from "./lib/components/ThemeToggle.svelte";
  import Footer from "./lib/components/Footer.svelte";

  // Initialize from the current URL so we don't flash the normal layout
  // on "direct link" routes like /examples/* or /stickers/*.
  let path = typeof window !== "undefined" ? window.location.pathname || "/" : "/";

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

  const STATIC_PAGES = {
    "/work": {
      title: "Work",
      subtitle: "Selected projects and experiments."
    },
    "/about": {
      title: "About",
      subtitle: "A tiny studio making playful internet objects."
    },
    "/services": {
      title: "Services",
      subtitle: "Design, prototyping, and UI engineering."
    },
    "/contact": {
      title: "Contact",
      subtitle: "Say hello."
    },
    "/privacy": {
      title: "Privacy",
      subtitle: "No trackers. No ads. Just stickers."
    },
    "/terms": {
      title: "Terms",
      subtitle: "Be kind. Don't scrape. Enjoy the drops."
    }
  };

  $: cleanPath = (path || "/").toString().replace(/\/+$/, "") || "/";

  $: isExamples = cleanPath.startsWith("/examples") || cleanPath.startsWith("/example");
  $: isStickerInspect = cleanPath.startsWith("/stickers/");
  $: staticPage = STATIC_PAGES[cleanPath] || null;
  $: stickerSlug = isStickerInspect
    ? cleanPath.replace(/^\/stickers\/+/, "").replace(/\/+$/, "")
    : "";
</script>

<div class="app" class:app--has-footer={!isStickerInspect}>
  {#if !isStickerInspect}
    <div class="topbar">
      <div class="topbar__actions">
        <ThemeToggle />
      </div>
    </div>
  {/if}

  <main class="content" class:content--inspect={isStickerInspect}>
    {#if isStickerInspect}
      <StickerInspect slug={stickerSlug} />
    {:else if isExamples}
      <Examples />
    {:else if staticPage}
      <StaticPage {...staticPage} />
    {:else}
      <Home />
    {/if}
  </main>

  {#if !isStickerInspect}
    <Footer />
  {/if}
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 900px) {
    /*
      Desktop UX:
      When the page content is short, the flex "sticky footer" pattern makes the footer
      peek into the initial viewport. Give the main content a viewport-sized minimum so
      the footer always starts just below the fold (requires a small scroll to reveal).
    */
    .app--has-footer .content:not(.content--inspect) {
      min-height: 100svh;
    }
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    padding: 16px 20px;
  }

  .topbar__actions {
    display: flex;
    gap: 8px;
  }

  .content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px 60px;
    flex: 1;
  }

  .content--inspect {
    max-width: none;
    padding: 0;
  }
</style>
