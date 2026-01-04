import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";

import ThemeToggle from "../src/lib/components/ThemeToggle.svelte";

const setMatchMedia = ({ prefersDark }) => {
  const listeners = new Set();
  const mq = {
    media: "(prefers-color-scheme: dark)",
    matches: Boolean(prefersDark),
    addEventListener: (_event, handler) => listeners.add(handler),
    removeEventListener: (_event, handler) => listeners.delete(handler),
    dispatch: () => {
      for (const handler of listeners) handler(new Event("change"));
    },
  };

  window.matchMedia = vi.fn(() => mq);
  return mq;
};

test("ThemeToggle honors stored theme and toggles/persists on click", async () => {
  localStorage.setItem("theme", "dark");
  setMatchMedia({ prefersDark: false });

  render(ThemeToggle);

  const button = await screen.findByRole("switch", { name: /toggle theme/i });
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(button).toHaveAttribute("aria-checked", "true");

  await fireEvent.click(button);
  expect(localStorage.getItem("theme")).toBe("light");
  expect(document.documentElement.dataset.theme).toBe("light");
  expect(button).toHaveAttribute("aria-checked", "false");
});

test("ThemeToggle follows system theme until user locks a choice", async () => {
  localStorage.removeItem("theme");
  const mq = setMatchMedia({ prefersDark: true });

  render(ThemeToggle);

  const button = await screen.findByRole("switch", { name: /toggle theme/i });
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(localStorage.getItem("theme")).toBe(null);

  // System changes -> component updates (not locked yet).
  mq.matches = false;
  mq.dispatch();
  expect(document.documentElement.dataset.theme).toBe("light");

  // User clicks -> locks and persists choice.
  await fireEvent.click(button);
  expect(localStorage.getItem("theme")).toBe("dark");
  expect(document.documentElement.dataset.theme).toBe("dark");

  // Further system changes should be ignored once locked.
  mq.matches = false;
  mq.dispatch();
  expect(document.documentElement.dataset.theme).toBe("dark");
});

test("ThemeToggle falls back to system theme when storage access fails", async () => {
  const mq = setMatchMedia({ prefersDark: true });

  const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("blocked");
  });

  render(ThemeToggle);

  await screen.findByRole("switch", { name: /toggle theme/i });
  expect(document.documentElement.dataset.theme).toBe("dark");

  mq.matches = false;
  mq.dispatch();
  expect(document.documentElement.dataset.theme).toBe("light");

  getItem.mockRestore();
});
