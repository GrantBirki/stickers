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
    </div>
  </div>
</footer>

<style>
  .studio-footer {
    /*
      Use the site's tokens, but create a flatter "paper" tint for the footer.
      No hardcoded colors: everything derives from existing variables.
    */
    /* Match the page background exactly so the footer reads as part of the page. */
    --footer-bg: var(--bg);
    --footer-fg: var(--fg);
    --footer-muted: var(--muted);
    --footer-rule: color-mix(in srgb, var(--rule) 82%, transparent);
    --footer-wordmark: color-mix(in srgb, var(--footer-fg) 94%, var(--footer-bg) 6%);
    --footer-vignette: color-mix(in srgb, var(--footer-fg) 8%, transparent);

    position: relative;
    background-color: var(--footer-bg);
    color: var(--footer-fg);
    overflow: hidden;
    margin-top: auto;

    transition: background-color 220ms ease, color 220ms ease;
  }

  :global(:root[data-theme="dark"]) .studio-footer {
    --footer-rule: color-mix(in srgb, var(--rule) 90%, transparent);
    /* Avoid pure-white glare in dark mode. */
    --footer-wordmark: color-mix(in srgb, var(--footer-fg) 90%, var(--footer-bg) 10%);
    --footer-vignette: color-mix(in srgb, var(--footer-fg) 10%, transparent);
  }

  /* Subtle material depth: vignette + grain (no viewport-dependent gradients). */
  .studio-footer::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(900px circle at 12% 10%, var(--footer-vignette), transparent 62%),
      radial-gradient(900px circle at 88% 86%, var(--footer-vignette), transparent 66%);
    opacity: 0.55;
  }

  .studio-footer::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    /* Cheap, uniform "film grain" using ultra-low-contrast stripes. */
    background-image:
      repeating-linear-gradient(
        0deg,
        color-mix(in srgb, var(--footer-fg) 3%, transparent) 0px,
        transparent 1px,
        transparent 3px
      ),
      repeating-linear-gradient(
        90deg,
        color-mix(in srgb, var(--footer-fg) 2%, transparent) 0px,
        transparent 1px,
        transparent 4px
      );
    opacity: 0.08;
    mix-blend-mode: overlay;
  }

  .studio-footer__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: clamp(60px, 8vw, 92px) clamp(20px, 6vw, 64px);
    /* Subtle inset so the rule + link align with the "B" rather than the container edge. */
    --brand-inset: clamp(2px, 1vw, 14px);
    position: relative;
    z-index: 1;
  }

  .studio-footer__rule {
    height: 1px;
    margin-left: var(--brand-inset);
    background: linear-gradient(
      to right,
      transparent,
      color-mix(in srgb, var(--footer-rule) 70%, var(--footer-fg) 30%),
      transparent
    );
    opacity: 0.95;
  }

  .studio-footer__source:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--link) 55%, transparent);
    outline-offset: 3px;
    border-radius: 6px;
  }

  .studio-footer__hero {
    padding-top: clamp(34px, 5vw, 56px);
    padding-bottom: clamp(26px, 4vw, 48px);
    padding-left: var(--brand-inset);
    display: grid;
    gap: clamp(22px, 3.2vw, 38px);
    transition: color 220ms ease;
  }

  .studio-footer__wordmark {
    position: relative;
    font-family: var(--font-sans, system-ui, -apple-system, Segoe UI, sans-serif);
    font-weight: 900;
    font-variation-settings: "wght" 900, "wdth" 100, "opsz" 24;
    font-kerning: normal;
    text-rendering: geometricPrecision;
    letter-spacing: -0.072em;
    line-height: 0.82;
    /* ~6% smaller than previous to give the mark breathing room. */
    font-size: clamp(70px, 15.2vw, 216px);
    color: var(--footer-wordmark);
    user-select: none;
    pointer-events: none;
    transition: color 220ms ease;
  }

  /*
    Subtle "pixel notch" cut-outs:
    overlay a handful of tiny squares in the footer background color.
    They're positioned by percentage within the wordmark box (intentionally minimal).
  */
  .studio-footer__wordmark::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    --n: 0.08em;
    background:
      linear-gradient(var(--footer-bg), var(--footer-bg)) 10% 54% / var(--n) var(--n) no-repeat,
      linear-gradient(var(--footer-bg), var(--footer-bg)) 16% 41% / var(--n) var(--n) no-repeat,
      linear-gradient(var(--footer-bg), var(--footer-bg)) 33% 62% / var(--n) var(--n) no-repeat,
      linear-gradient(var(--footer-bg), var(--footer-bg)) 52% 39% / var(--n) var(--n) no-repeat,
      linear-gradient(var(--footer-bg), var(--footer-bg)) 62% 57% / var(--n) var(--n) no-repeat,
      linear-gradient(var(--footer-bg), var(--footer-bg)) 78% 44% / var(--n) var(--n) no-repeat;
    opacity: 0.95;
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
