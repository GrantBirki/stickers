import { test, expect } from "./test-utils.ts";
import { render, waitFor } from "./helpers/svelte.ts";

import Cards from "../src/Cards.svelte";
import { activeCard } from "../src/lib/stores/activeCard.ts";

test("Cards toggles the .active class when the activeCard element is inside the grid", async () => {
  const { container } = render(Cards);

  const grid = container.querySelector("section.card-grid");
  expect(grid).not.toBe(null);
  expect(grid.classList.contains("active")).toBe(false);

  const child = document.createElement("div");
  grid.appendChild(child);

  activeCard.set(child);
  await waitFor(() => expect(grid.classList.contains("active")).toBe(true));

  activeCard.set(document.body);
  await waitFor(() => expect(grid.classList.contains("active")).toBe(false));
});

