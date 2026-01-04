import { test, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";

import StaticPage from "../src/pages/StaticPage.svelte";

test("StaticPage renders title and optional subtitle/body", () => {
  render(StaticPage, {
    props: {
      title: "Work",
      subtitle: "Selected projects.",
      body: "Hello world",
    },
  });

  expect(screen.getByRole("heading", { level: 1, name: "Work" })).toBeInTheDocument();
  expect(screen.getByText("Selected projects.")).toBeInTheDocument();
  expect(screen.getByText("Hello world")).toBeInTheDocument();
});

test("StaticPage omits subtitle/body when empty strings", () => {
  const { container } = render(StaticPage, { props: { title: "About", subtitle: "", body: "" } });

  expect(screen.getByRole("heading", { level: 1, name: "About" })).toBeInTheDocument();
  expect(container.querySelector(".page__sub")).toBe(null);
  expect(container.querySelector(".page__body")).toBe(null);
});
