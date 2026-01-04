<footer class="studio-footer">
  <div class="studio-footer__inner">
    <div class="studio-footer__rule" aria-hidden="true"></div>

    <div class="studio-footer__hero">
      <div class="studio-footer__wordmark" aria-hidden="true">BIRKI</div>

      <a
        class="studio-footer__source"
        href="https://github.com/GrantBirki/stickers"
        target="_blank"
        rel="noopener noreferrer"
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
        <span class="studio-footer__source-text">source code</span>
      </a>

      <div class="studio-footer__signature">Made with ❤️ by Grant Birkinbine</div>
    </div>
  </div>
</footer>

<style>
  .studio-footer {
    /*
      Footer intentionally inherits the same page background (no panel, no vignette).
      No hardcoded colors: everything derives from the global theme variables.
    */
    /* Match the page background exactly so the footer reads as part of the page. */
    --footer-bg: var(--bg);
    --footer-fg: var(--fg);
    --footer-muted: var(--muted);
    --footer-rule: var(--rule);
    --footer-wordmark: color-mix(in srgb, var(--footer-fg) 94%, var(--footer-bg) 6%);

    position: relative;
    /* Let the true page background show through (no footer panel). */
    background: transparent;
    color: var(--footer-fg);
    overflow: hidden;
    margin-top: auto;

    transition: color 220ms ease;
  }

  :global(:root[data-theme="dark"]) .studio-footer {
    /* Avoid pure-white glare in dark mode. */
    --footer-wordmark: color-mix(in srgb, var(--footer-fg) 90%, var(--footer-bg) 10%);
  }

  .studio-footer__inner {
    max-width: 1200px;
    margin: 0 auto;
    /* Reduce bottom whitespace without cramping the mark. */
    padding: clamp(56px, 8vw, 92px) clamp(20px, 6vw, 64px) clamp(34px, 5vw, 58px);
    /* Subtle inset so the rule + link align with the "B" rather than the container edge. */
    --brand-inset: clamp(2px, 1vw, 14px);
    position: relative;
  }

  .studio-footer__rule {
    height: 1px;
    margin-left: var(--brand-inset);
    margin-right: var(--brand-inset);
    background: var(--footer-rule);
  }

  .studio-footer__source:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--link) 55%, transparent);
    outline-offset: 3px;
    border-radius: 6px;
  }

  .studio-footer__hero {
    padding-top: clamp(30px, 4.5vw, 52px);
    padding-bottom: clamp(10px, 2.2vw, 20px);
    display: grid;
    gap: clamp(16px, 3vw, 30px);
    transition: color 220ms ease;
  }

  .studio-footer__wordmark {
    position: relative;
    font-family: var(--font-sans, system-ui, -apple-system, Segoe UI, sans-serif);
    font-weight: 900;
    font-variation-settings: "wght" 900, "wdth" 100, "opsz" 24;
    font-kerning: normal;
    text-rendering: geometricPrecision;
    letter-spacing: -0.074em;
    line-height: 0.82;
    /* Slightly larger to reclaim space while staying comfortable. */
    font-size: clamp(74px, 16.2vw, 232px);
    color: var(--footer-wordmark);
    user-select: none;
    pointer-events: none;
    transition: color 220ms ease;
    margin-left: var(--brand-inset);
  }

  .studio-footer__source {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    width: fit-content;
    padding: 12px 14px;
    min-height: 44px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--footer-fg) 14%, transparent);
    background: color-mix(in srgb, var(--footer-fg) 6%, transparent);

    font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace);
    font-size: 0.86rem;
    font-weight: 650;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--footer-fg);
    opacity: 0.86;
    text-decoration: none;
    margin-left: var(--brand-inset);
    transition:
      opacity 180ms ease,
      background-color 220ms ease,
      border-color 220ms ease,
      transform 180ms ease;
  }

  .studio-footer__source:hover {
    opacity: 1;
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--footer-fg) 24%, transparent);
  }

  .studio-footer__source svg {
    display: block;
    opacity: 0.92;
    transition: transform 180ms ease, opacity 180ms ease;
  }

  .studio-footer__source:hover svg {
    opacity: 1;
    transform: translateY(-1px);
  }

  .studio-footer__source-text {
    position: relative;
  }

  .studio-footer__source-text::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -4px;
    height: 1px;
    background: currentColor;
    opacity: 0.45;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 180ms ease, opacity 180ms ease;
  }

  .studio-footer__source:hover .studio-footer__source-text::after {
    transform: scaleX(1);
    opacity: 0.7;
  }

  .studio-footer__signature {
    text-align: center;
    justify-self: center;
    font-size: 0.9rem;
    line-height: 1.25;
    /* Must stay readable while still feeling like a subtle signature line. */
    color: color-mix(in srgb, var(--footer-fg) 74%, var(--footer-bg) 26%);
  }

  @media (prefers-reduced-motion: reduce) {
    .studio-footer,
    .studio-footer__hero,
    .studio-footer__wordmark,
    .studio-footer__source,
    .studio-footer__source svg,
    .studio-footer__source-text::after {
      transition: none;
    }
  }
</style>
