import { test, expect } from "./test-utils.ts";
import { render, screen } from "./helpers/svelte.ts";

import Examples from "../src/pages/Examples.svelte";

test("Examples renders the playground page and grouped card sections", () => {
  const { container } = render(Examples);

  expect(screen.getByRole("heading", { level: 1, name: "Examples" })).toBeTruthy();
  expect(screen.getByText("#mike-mike-dms")).toBeTruthy();

  expect(screen.getByRole("link", { name: "Basic / Non-Holo" })).toBeTruthy();

  const cards = container.querySelectorAll(".card");
  expect(cards.length).toBeGreaterThan(5);

  // The showcase card in the header is explicitly marked showcase={true}.
  expect(container.querySelector(".showcase .card")).not.toBe(null);
});
