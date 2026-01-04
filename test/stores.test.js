import { test, expect } from "vitest";

import { get } from "svelte/store";

import { activeCard } from "../src/lib/stores/activeCard.js";
import { activeStickerId } from "../src/lib/stores/activeStickerId.js";

test("activeCard store defaults to undefined and can be updated", () => {
  expect(get(activeCard)).toBe(undefined);

  activeCard.set("card-1");
  expect(get(activeCard)).toBe("card-1");

  activeCard.set(undefined);
  expect(get(activeCard)).toBe(undefined);
});

test("activeStickerId store defaults to undefined and notifies subscribers", () => {
  expect(get(activeStickerId)).toBe(undefined);

  const seen = [];
  const unsubscribe = activeStickerId.subscribe((value) => {
    seen.push(value);
  });

  activeStickerId.set("stickers-foo");
  activeStickerId.set("stickers-bar");
  unsubscribe();

  expect(seen).toEqual([undefined, "stickers-foo", "stickers-bar"]);
});
