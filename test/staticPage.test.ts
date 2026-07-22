import { test, expect } from "./test-utils.ts";
import { render, screen } from "./helpers/svelte.ts";

import StaticPage from "../src/pages/StaticPage.svelte";

test("StaticPage renders title and optional subtitle/body", () => {
  render(StaticPage, {
    props: {
      title: "Work",
      subtitle: "Selected projects.",
      body: "Hello world",
    },
  });

  expect(screen.getByRole("heading", { level: 1, name: "Work" })).toBeTruthy();
  expect(screen.getByText("Selected projects.")).toBeTruthy();
  expect(screen.getByText("Hello world")).toBeTruthy();
});

test("StaticPage omits subtitle/body when empty strings", () => {
  const { container } = render(StaticPage, { props: { title: "About", subtitle: "", body: "" } });

  expect(screen.getByRole("heading", { level: 1, name: "About" })).toBeTruthy();
  expect(container.querySelector(".page__sub")).toBe(null);
  expect(container.querySelector(".page__body")).toBe(null);
});
