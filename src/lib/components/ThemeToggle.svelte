<script>
  import { onMount } from "svelte";

  // Zero-deps theme toggle:
  // - sets `data-theme="light|dark"` on <html>
  // - persists explicit choice in localStorage
  // - defaults to OS preference if nothing is stored
  let theme = "light"; // applied theme: "light" | "dark"
  let locked = false; // if true, user explicitly chose a theme (stored)

  const getSystemTheme = () =>
    window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";

  const apply = (t) => {
    theme = t;
    document.documentElement.dataset.theme = t;
  };

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    locked = true;
    localStorage.setItem("theme", next);
    apply(next);
  };

  onMount(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") {
        locked = true;
        apply(stored);
      } else {
        locked = false;
        apply(getSystemTheme());
      }
    } catch {
      locked = false;
      apply(getSystemTheme());
    }

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (locked) return;
      apply(getSystemTheme());
    };
    mq?.addEventListener?.("change", onSystemChange);
    return () => mq?.removeEventListener?.("change", onSystemChange);
  });
</script>

<button
  type="button"
  class="theme-toggle"
  role="switch"
  aria-checked={theme === "dark"}
  aria-label="Toggle theme"
  title="Toggle theme"
  on:click={toggle}
>
  <span class="theme-toggle__track" aria-hidden="true">
    <span class="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 18a6 6 0 1 1 0-12a6 6 0 0 1 0 12ZM11 1h2v3h-2V1Zm0 19h2v3h-2v-3ZM3.5 4.9l1.4-1.4l2.1 2.1L5.6 7L3.5 4.9ZM17 18.4l1.4-1.4l2.1 2.1l-1.4 1.4L17 18.4ZM1 11h3v2H1v-2Zm19 0h3v2h-3v-2ZM3.5 19.1L5.6 17l1.4 1.4l-2.1 2.1l-1.4-1.4ZM17 5.6l2.1-2.1l1.4 1.4L18.4 7L17 5.6Z"
          fill="currentColor"
        />
      </svg>
    </span>
    <span class="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M21 14.6A8.1 8.1 0 0 1 9.4 3a7 7 0 1 0 11.6 11.6Z"
          fill="currentColor"
        />
      </svg>
    </span>
    <span class="theme-toggle__thumb" aria-hidden="true" data-theme={theme}></span>
  </span>
</button>

<style>
  .theme-toggle {
    border: none;
    padding: 0;
    background: transparent;
    cursor: pointer;
  }

  .theme-toggle__track {
    position: relative;
    width: 62px;
    height: 34px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 9px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.10);
    user-select: none;
  }

  .theme-toggle__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    opacity: 0.75;
    pointer-events: none;
  }

  .theme-toggle__thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: var(--bg);
    border: 1px solid var(--border);
    box-shadow:
      0 8px 18px rgba(0, 0, 0, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 0.55);
    transition: transform 180ms ease;
  }

  .theme-toggle__thumb[data-theme="dark"] {
    transform: translateX(28px);
  }
</style>

