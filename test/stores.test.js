import test from "node:test";
import assert from "node:assert/strict";

import { get } from "svelte/store";

import { activeCard } from "../src/lib/stores/activeCard.js";
import { activeStickerId } from "../src/lib/stores/activeStickerId.js";

test("activeCard store defaults to undefined and can be updated", () => {
  assert.equal(get(activeCard), undefined);

  activeCard.set("card-1");
  assert.equal(get(activeCard), "card-1");

  activeCard.set(undefined);
  assert.equal(get(activeCard), undefined);
});

test("activeStickerId store defaults to undefined and notifies subscribers", () => {
  assert.equal(get(activeStickerId), undefined);

  const seen = [];
  const unsubscribe = activeStickerId.subscribe((value) => {
    seen.push(value);
  });

  activeStickerId.set("stickers-foo");
  activeStickerId.set("stickers-bar");
  unsubscribe();

  assert.deepEqual(seen, [undefined, "stickers-foo", "stickers-bar"]);
});

