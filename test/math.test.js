import { test, expect } from "vitest";

import { adjust, clamp, round } from "../src/lib/helpers/Math.js";

test("round() rounds to the default precision (3) and returns a number", () => {
  expect(round(1.23456)).toBe(1.235);
  expect(round(42)).toBe(42);
  expect(typeof round(1.2)).toBe("number");
});

test("round() supports a custom precision", () => {
  expect(round(1.23456, 2)).toBe(1.23);
  expect(round(-1.23456, 2)).toBe(-1.23);
});

test("clamp() clamps using the default range (0..100)", () => {
  expect(clamp(-1)).toBe(0);
  expect(clamp(0)).toBe(0);
  expect(clamp(50)).toBe(50);
  expect(clamp(100)).toBe(100);
  expect(clamp(101)).toBe(100);
});

test("clamp() clamps using a custom range", () => {
  expect(clamp(5, 10, 20)).toBe(10);
  expect(clamp(15, 10, 20)).toBe(15);
  expect(clamp(25, 10, 20)).toBe(20);
});

test("adjust() remaps a value from one range into another", () => {
  // Example from the source code comment.
  expect(adjust(10, 0, 100, 100, 0)).toBe(90);

  // Includes rounding behavior via round().
  expect(adjust(1, 0, 3, 0, 1)).toBe(0.333);
});
