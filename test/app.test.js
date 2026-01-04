import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";

import App from "../src/App.svelte";

const okJson = (value) => ({
  ok: true,
  json: async () => value,
});

test("App routes static pages and includes ThemeToggle + Footer outside inspect routes", async () => {
  window.history.pushState({}, "", "/work");

  render(App);

  expect(await screen.findByRole("heading", { level: 1, name: "Work" })).toBeInTheDocument();
  expect(screen.getByRole("switch", { name: /toggle theme/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /source code/i })).toBeInTheDocument();

  // popstate navigation updates the rendered page.
  window.history.pushState({}, "", "/about/");
  window.dispatchEvent(new PopStateEvent("popstate"));
  expect(await screen.findByRole("heading", { level: 1, name: "About" })).toBeInTheDocument();
});

test("App routes /stickers/* to StickerInspect and hides ThemeToggle/Footer", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      okJson([
        {
          id: "stickers-foo-001",
          name: "Foo",
          set: "stickers",
          rarity: "common",
          sticker_img: "/img/stickers/foo.png",
        },
      ])
    )
  );

  window.history.pushState({}, "", "/stickers/foo");

  render(App);

  expect(screen.queryByRole("switch", { name: /toggle theme/i })).toBe(null);
  expect(screen.queryByRole("link", { name: /source code/i })).toBe(null);

  expect(await screen.findByLabelText("Flip card: Foo.")).toBeInTheDocument();

  const main = document.querySelector("main.content");
  expect(main.classList.contains("content--inspect")).toBe(true);
});

