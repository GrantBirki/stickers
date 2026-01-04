import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";

import CardStub from "./mocks/CardStub.svelte";

vi.mock("../src/lib/components/Card.svelte", () => ({
  default: CardStub,
}));

import Examples from "../src/pages/Examples.svelte";

test("Examples renders the playground page and grouped card sections", () => {
  const { container } = render(Examples);

  expect(screen.getByRole("heading", { level: 1, name: "Examples" })).toBeInTheDocument();
  expect(screen.getByText("#mike-mike-dms")).toBeInTheDocument();

  expect(screen.getByRole("link", { name: "Basic / Non-Holo" })).toBeInTheDocument();

  const cards = screen.getAllByTestId("card-stub");
  expect(cards.length).toBeGreaterThan(5);

  // The showcase card in the header is explicitly marked showcase={true}.
  expect(container.querySelector('[data-showcase="true"]')).not.toBe(null);
});

