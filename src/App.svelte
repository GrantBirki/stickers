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

  <footer class="footer">
    <div class="footer__inner">
      <a
        class="footer__link"
        href="https://github.com/GrantBirki/stickers"
        target="_blank"
        rel="noreferrer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-github"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"
          />
        </svg>
        <span>source code</span>
      </a>
    </div>
  </footer>
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

  .footer {
    border-top: 1px solid var(--border);
    padding: 14px 20px;
    margin-top: 10px;
  }

  .footer__inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: flex-end;
  }

  .footer__link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--text);
    text-decoration: none;
    opacity: 0.8;
    font-size: 0.95rem;
  }

  .footer__link:hover {
    opacity: 1;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
