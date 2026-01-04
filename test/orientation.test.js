import test from "node:test";
import assert from "node:assert/strict";

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

    assert.equal(addCalls.length, 1);
    assert.equal(addCalls[0].event, "deviceorientation");
    assert.equal(addCalls[0].options, true);
    assert.equal(typeof addCalls[0].handler, "function");

    // Initial value comes from getOrientationObject() called with no event.
    assert.deepEqual(seen[0], {
      absolute: { alpha: 0, beta: 0, gamma: 0 },
      relative: { alpha: 0, beta: 0, gamma: 0 },
    });

    // First reading becomes the base orientation, so relative should be 0.
    addCalls[0].handler({ alpha: 10, beta: 20, gamma: 30 });
    assert.deepEqual(seen.at(-1), {
      absolute: { alpha: 10, beta: 20, gamma: 30 },
      relative: { alpha: 0, beta: 0, gamma: 0 },
    });

    // Subsequent readings are relative to the first reading.
    addCalls[0].handler({ alpha: 11, beta: 22, gamma: 29 });
    assert.deepEqual(seen.at(-1), {
      absolute: { alpha: 11, beta: 22, gamma: 29 },
      relative: { alpha: 1, beta: 2, gamma: -1 },
    });

    unsubscribe();

    assert.equal(removeCalls.length, 1);
    assert.equal(removeCalls[0].event, "deviceorientation");
    assert.equal(removeCalls[0].handler, addCalls[0].handler);
    assert.equal(removeCalls[0].options, true);
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
    assert.deepEqual(seen.at(-1).relative, { alpha: 0, beta: 0, gamma: 0 });

    // Reset should make the next reading the new base.
    resetBaseOrientation();
    handler({ alpha: 1, beta: 2, gamma: 3 });
    assert.deepEqual(seen.at(-1).relative, { alpha: 0, beta: 0, gamma: 0 });

    unsubscribe();
  } finally {
    globalThis.window = originalWindow;
  }
});

