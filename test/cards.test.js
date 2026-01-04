import { test, expect } from "vitest";
import { render, waitFor } from "@testing-library/svelte";

import Cards from "../src/Cards.svelte";
import { activeCard } from "../src/lib/stores/activeCard.js";

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

