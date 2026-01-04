import { test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";

import Home from "../src/pages/Home.svelte";

const okJson = (value) => ({
  ok: true,
  json: async () => value,
});

test("Home loads stickers, builds slugs, and drives the inspect FAB navigation", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      const u = url.toString();
      if (u.includes("stickers.json")) {
        return okJson([
          {
            id: "stickers-foo-001",
            name: "Foo",
            set: "stickers",
            number: "0001",
            rarity: "holographic",
            sticker_img: "/img/stickers/foo.png",
            drop_date: "2026-01-02",
            description: "First drop",
            total_prints: 10,
          },
          {
            id: "stickers-foo-002",
            name: "Foo Two",
            set: "stickers",
            number: "0002",
            rarity: "common",
            sticker_img: "/img/stickers/foo2.png",
          },
          // Edge case: blank id -> should not be added to the inspect slug map.
          { id: "", name: "Bad Row", set: "stickers", rarity: "common" },
        ]);
      }
      if (u.includes("site.json")) {
        return okJson({ display_next_card_as_hidden: false });
      }
      throw new Error(`unexpected fetch: ${u}`);
    })
  );

  render(Home);

  expect(screen.getByText("loading...")).toBeInTheDocument();

  const foo = await screen.findByLabelText("Expand card: Foo.");
  const fooTwo = await screen.findByLabelText("Expand card: Foo Two.");
  expect(screen.queryByText("loading...")).toBe(null);

  // Activate a card -> inspect FAB appears.
  await fireEvent.click(foo);

  const inspect = await screen.findByRole("link", { name: /open inspect view/i });
  expect(inspect.getAttribute("href")).toBe("/stickers/foo");

  // Focus helper: early return when focus is missing.
  Object.defineProperty(inspect, "focus", { value: undefined, configurable: true });
  await fireEvent.pointerDown(inspect);

  // Focus helper: try path when focus accepts options.
  const focusOk = vi.fn();
  Object.defineProperty(inspect, "focus", { value: focusOk, configurable: true });
  await fireEvent.pointerDown(inspect);
  expect(focusOk).toHaveBeenCalledWith({ preventScroll: true });

  // Focus helper: catch path when focus throws on options.
  const focusThrows = vi.fn((opts) => {
    if (opts && typeof opts === "object") throw new Error("no options supported");
  });
  Object.defineProperty(inspect, "focus", { value: focusThrows, configurable: true });
  await fireEvent.touchStart(inspect);
  expect(focusThrows).toHaveBeenCalledTimes(2);
  expect(focusThrows.mock.calls[0][0]).toEqual({ preventScroll: true });
  expect(focusThrows.mock.calls[1][0]).toBe(undefined);

  // Normal click navigates via history/pushState and emits a popstate event.
  const pushStateSpy = vi.spyOn(window.history, "pushState");
  const dispatchSpy = vi.spyOn(window, "dispatchEvent");

  await fireEvent.click(inspect, { button: 0 });
  expect(pushStateSpy).toHaveBeenCalledWith({}, "", "/stickers/foo");
  expect(dispatchSpy).toHaveBeenCalled();
  expect(dispatchSpy.mock.calls.at(-1)[0].type).toBe("popstate");

  // Modifier keys or non-left clicks should be ignored.
  pushStateSpy.mockClear();
  await fireEvent.click(inspect, { metaKey: true, button: 0 });
  await fireEvent.click(inspect, { button: 1 });
  expect(pushStateSpy).not.toHaveBeenCalled();

  // Activate the second card -> slug collision forces full slug.
  await fireEvent.click(fooTwo);
  await waitFor(() => expect(inspect.getAttribute("href")).toBe("/stickers/foo-002"));
});

test("Home appends a mystery card when configured via site.json", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      const u = url.toString();
      if (u.includes("stickers.json")) return okJson([]);
      if (u.includes("site.json")) return okJson({ display_next_card_as_hidden: true });
      throw new Error(`unexpected fetch: ${u}`);
    })
  );

  render(Home);

  // Mystery card is still a sticker card, but uses a special "mystery" face and alt text.
  expect(await screen.findByAltText("A mystery card")).toBeInTheDocument();
});

test("Home handles fetch failures with safe defaults", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      const u = url.toString();
      if (u.includes("stickers.json")) return { ok: false, json: async () => [] };
      if (u.includes("site.json")) {
        throw new Error("blocked");
      }
      throw new Error(`unexpected fetch: ${u}`);
    })
  );

  render(Home);

  // With no data, we should simply stop loading and render nothing.
  await waitFor(() => expect(screen.queryByText("loading...")).toBe(null));
  expect(screen.queryByLabelText(/Expand card:/)).toBe(null);
});

