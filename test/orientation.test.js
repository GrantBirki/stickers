import { test, expect } from "vitest";

import { orientation, resetBaseOrientation } from "../src/lib/stores/orientation.js";

test("orientation store computes absolute + relative values and cleans up listeners", () => {
  resetBaseOrientation();

  const originalWindow = globalThis.window;
  const addCalls = [];
  const removeCalls = [];

  globalThis.window = {
    addEventListener(event, handler, options) {
      addCalls.push({ event, handler, options });
    },
    removeEventListener(event, handler, options) {
      removeCalls.push({ event, handler, options });
    },
  };

  try {
    const seen = [];
    const unsubscribe = orientation.subscribe((value) => {
      seen.push(value);
    });

    expect(addCalls.length).toBe(1);
    expect(addCalls[0].event).toBe("deviceorientation");
    expect(addCalls[0].options).toBe(true);
    expect(typeof addCalls[0].handler).toBe("function");

    // Initial value comes from getOrientationObject() called with no event.
    expect(seen[0]).toEqual({
      absolute: { alpha: 0, beta: 0, gamma: 0 },
      relative: { alpha: 0, beta: 0, gamma: 0 },
    });

    // First reading becomes the base orientation, so relative should be 0.
    addCalls[0].handler({ alpha: 10, beta: 20, gamma: 30 });
    expect(seen.at(-1)).toEqual({
      absolute: { alpha: 10, beta: 20, gamma: 30 },
      relative: { alpha: 0, beta: 0, gamma: 0 },
    });

    // Subsequent readings are relative to the first reading.
    addCalls[0].handler({ alpha: 11, beta: 22, gamma: 29 });
    expect(seen.at(-1)).toEqual({
      absolute: { alpha: 11, beta: 22, gamma: 29 },
      relative: { alpha: 1, beta: 2, gamma: -1 },
    });

    unsubscribe();

    expect(removeCalls.length).toBe(1);
    expect(removeCalls[0].event).toBe("deviceorientation");
    expect(removeCalls[0].handler).toBe(addCalls[0].handler);
    expect(removeCalls[0].options).toBe(true);
  } finally {
    globalThis.window = originalWindow;
  }
});

test("resetBaseOrientation() resets the base orientation for the next reading", () => {
  resetBaseOrientation();

  const originalWindow = globalThis.window;
  let handler;

  globalThis.window = {
    addEventListener(_event, nextHandler) {
      handler = nextHandler;
    },
    removeEventListener() {},
  };

  try {
    const seen = [];
    const unsubscribe = orientation.subscribe((value) => seen.push(value));

    handler({ alpha: 3, beta: 4, gamma: 5 });
    expect(seen.at(-1).relative).toEqual({ alpha: 0, beta: 0, gamma: 0 });

    // Reset should make the next reading the new base.
    resetBaseOrientation();
    handler({ alpha: 1, beta: 2, gamma: 3 });
    expect(seen.at(-1).relative).toEqual({ alpha: 0, beta: 0, gamma: 0 });

    unsubscribe();
  } finally {
    globalThis.window = originalWindow;
  }
});
