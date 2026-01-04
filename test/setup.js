import "@testing-library/jest-dom/vitest";

import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/svelte";

import { activeCard } from "../src/lib/stores/activeCard.js";
import { activeStickerId } from "../src/lib/stores/activeStickerId.js";
import { resetBaseOrientation } from "../src/lib/stores/orientation.js";

// jsdom doesn't implement these browser APIs consistently; keep tests hermetic.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => {
    let matches = false;
    const listeners = new Set();
    return {
      media: query,
      get matches() {
        return matches;
      },
      set matches(next) {
        matches = Boolean(next);
      },
      addEventListener: (_event, handler) => listeners.add(handler),
      removeEventListener: (_event, handler) => listeners.delete(handler),
      dispatchEvent: (event) => {
        for (const handler of listeners) handler(event);
        return true;
      },
    };
  },
});

if (!HTMLElement.prototype.scrollIntoView) {
  // App.svelte calls scrollIntoView when a hash is present.
  HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
}

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
}

// Node 25+ defines a global `localStorage` accessor (empty object by default).
// Vitest's jsdom environment doesn't override it because the key already exists
// on `globalThis`. Point it at jsdom's Storage so browser code works as expected.
const jsdomWindow = globalThis.jsdom?.window;
if (jsdomWindow) {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: jsdomWindow.localStorage,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: jsdomWindow.sessionStorage,
  });
  Object.defineProperty(globalThis, "Storage", {
    configurable: true,
    value: jsdomWindow.Storage,
  });
}

afterEach(() => {
  cleanup();

  // Reset shared stores between tests (they're singletons).
  activeCard.set(undefined);
  activeStickerId.set(undefined);
  resetBaseOrientation();

  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
