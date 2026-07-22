import { JSDOM } from "jsdom";

import { afterEach, vi } from "./test-utils.ts";
import { cleanup } from "./helpers/svelte.ts";

import { activeCard } from "../src/lib/stores/activeCard.ts";
import { activeStickerId } from "../src/lib/stores/activeStickerId.ts";
import { resetBaseOrientation } from "../src/lib/stores/orientation.ts";

const jsdom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/",
  pretendToBeVisual: true,
});

const browserGlobals = [
  "window",
  "document",
  "navigator",
  "location",
  "history",
  "Node",
  "Text",
  "Comment",
  "DocumentFragment",
  "Element",
  "HTMLElement",
  "SVGElement",
  "HTMLAnchorElement",
  "HTMLButtonElement",
  "HTMLImageElement",
  "HTMLMediaElement",
  "Event",
  "CustomEvent",
  "MouseEvent",
  "FocusEvent",
  "PopStateEvent",
  "Storage",
  "localStorage",
  "sessionStorage",
  "getComputedStyle",
] as const;

Object.defineProperty(globalThis, "window", {
  configurable: true,
  writable: true,
  value: jsdom.window,
});
for (const key of browserGlobals.slice(1)) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: jsdom.window[key],
  });
}

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

Object.defineProperty(globalThis, "requestAnimationFrame", {
  configurable: true,
  writable: true,
  value: window.requestAnimationFrame.bind(window),
});
Object.defineProperty(globalThis, "cancelAnimationFrame", {
  configurable: true,
  writable: true,
  value: window.cancelAnimationFrame.bind(window),
});

afterEach(() => {
  cleanup();

  // Reset shared stores between tests (they're singletons).
  activeCard.set(undefined);
  activeStickerId.set(undefined);
  resetBaseOrientation();

  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
