<script>
  import { onMount } from "svelte";

  import Home from "./pages/Home.svelte";
  import Examples from "./pages/Examples.svelte";

  let path = "/";
  let themePref = "system"; // system | light | dark
  let appliedTheme = "light"; // light | dark

  const updatePath = () => {
    path = window.location.pathname || "/";
  };

  const applyTheme = (nextTheme) => {
    appliedTheme = nextTheme;
    document.documentElement.dataset.theme = nextTheme;
  };

  const getSystemTheme = () =>
    window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";

  const initTheme = () => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      themePref = stored;
      applyTheme(stored);
      return;
    }
    themePref = "system";
    applyTheme(getSystemTheme());
  };

  const setThemePref = (pref) => {
    if (pref === "system") {
      localStorage.removeItem("theme");
      themePref = "system";
      applyTheme(getSystemTheme());
      return;
    }
    localStorage.setItem("theme", pref);
    themePref = pref;
    applyTheme(pref);
  };

  const toggleTheme = () => {
    setThemePref(appliedTheme === "dark" ? "light" : "dark");
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
    initTheme();

    const onPop = () => updatePath();
    const onHash = () => scrollToHash();
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");

    const onSystemChange = () => {
      if (themePref !== "system") return;
      applyTheme(getSystemTheme());
    };

    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onHash);
    mq?.addEventListener?.("change", onSystemChange);

    scrollToHash();

    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", onHash);
      mq?.removeEventListener?.("change", onSystemChange);
    };
  });

  $: isExamples = path.startsWith("/examples");
</script>

<div class="app">
  <div class="topbar">
    <a class="topbar__brand" href="/">birki stickers</a>

    <nav class="topbar__nav" aria-label="Site">
      <a class:active={!isExamples} href="/">stickers</a>
      <a class:active={isExamples} href="/examples/">examples</a>
    </nav>

    <div class="topbar__actions">
      <button class="topbar__btn" type="button" on:click={toggleTheme}>
        theme: {appliedTheme}
      </button>
      <button
        class="topbar__btn"
        type="button"
        on:click={() => setThemePref("system")}
        disabled={themePref === "system"}
      >
        system
      </button>
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

  .topbar__nav {
    display: flex;
    gap: 10px;
  }

  .topbar__nav a {
    color: var(--text);
    text-decoration: none;
    opacity: 0.78;
    padding: 6px 10px;
    border-radius: 999px;
    transition: background 150ms ease, opacity 150ms ease;
  }

  .topbar__nav a:hover {
    opacity: 1;
    background: var(--surface-2);
  }

  .topbar__nav a.active {
    opacity: 1;
    background: var(--surface);
  }

  .topbar__actions {
    display: flex;
    gap: 8px;
  }

  .topbar__btn {
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    border-radius: 999px;
    padding: 8px 10px;
    font-family: Roboto;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .topbar__btn:disabled {
    opacity: 0.55;
    cursor: default;
  }

  .content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px 60px;
  }
</style>

