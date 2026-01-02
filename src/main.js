import App from "./App.svelte";
import { mount } from "svelte";

const gaId = import.meta.env.VITE_GA;

// Provide a stable, optional `window.gtag()` so component calls never crash.
window.dataLayer = window.dataLayer || [];
window.gtag =
  window.gtag ||
  function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

if (gaId) {
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", gaId, {
    linker: { domains: ["poke-holo.simey.me", "deck-24abcd.netlify.app"] }
  });
}

const target = document.getElementById("app");
if (!target) throw new Error("Missing #app mount target");

// Svelte 5 uses `mount()` (the `new Component(...)` API is no longer valid by default).
const app = mount(App, { target });

export default app;
