import assert from "node:assert/strict";
import { test } from "node:test";

import { interactionFromOrientation, interactionFromPoint, storedTheme } from "../src/lib/browser.ts";

test("pointer interaction maps the center and corners", () => {
  const rect = { left: 10, top: 20, width: 200, height: 400 } as DOMRect;
  assert.deepEqual(interactionFromPoint(rect, 110, 220), {
    backgroundX: 50,
    backgroundY: 50,
    glareX: 50,
    glareY: 50,
    rotateX: 0,
    rotateY: 0,
  });
  assert.equal(interactionFromPoint(rect, -100, 1000).glareX, 0);
  assert.equal(interactionFromPoint(rect, -100, 1000).glareY, 100);
});

test("orientation interaction clamps unsafe extremes", () => {
  assert.deepEqual(interactionFromOrientation(100, -100), {
    backgroundX: 63,
    backgroundY: 33,
    glareX: 100,
    glareY: 0,
    rotateX: -16,
    rotateY: -18,
  });
});

test("stored theme accepts only explicit theme values", () => {
  assert.equal(storedTheme({ getItem: () => "dark" }, "light"), "dark");
  assert.equal(storedTheme({ getItem: () => "invalid" }, "light"), "light");
  assert.equal(storedTheme({ getItem: () => { throw new Error("blocked"); } }, "dark"), "dark");
});
