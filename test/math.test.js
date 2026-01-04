import test from "node:test";
import assert from "node:assert/strict";

import { adjust, clamp, round } from "../src/lib/helpers/Math.js";

test("round() rounds to the default precision (3) and returns a number", () => {
  assert.equal(round(1.23456), 1.235);
  assert.equal(round(42), 42);
  assert.equal(typeof round(1.2), "number");
});

test("round() supports a custom precision", () => {
  assert.equal(round(1.23456, 2), 1.23);
  assert.equal(round(-1.23456, 2), -1.23);
});

test("clamp() clamps using the default range (0..100)", () => {
  assert.equal(clamp(-1), 0);
  assert.equal(clamp(0), 0);
  assert.equal(clamp(50), 50);
  assert.equal(clamp(100), 100);
  assert.equal(clamp(101), 100);
});

test("clamp() clamps using a custom range", () => {
  assert.equal(clamp(5, 10, 20), 10);
  assert.equal(clamp(15, 10, 20), 15);
  assert.equal(clamp(25, 10, 20), 20);
});

test("adjust() remaps a value from one range into another", () => {
  // Example from the source code comment.
  assert.equal(adjust(10, 0, 100, 100, 0), 90);

  // Includes rounding behavior via round().
  assert.equal(adjust(1, 0, 3, 0, 1), 0.333);
});

