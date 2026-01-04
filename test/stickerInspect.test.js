import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";

import StickerInspect from "../src/pages/StickerInspect.svelte";

const okJson = (value) => ({
  ok: true,
  json: async () => value,
});

test("StickerInspect loads a sticker by base slug and restores body overflow on unmount", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      expect(url.toString()).toMatch(/stickers\.json$/);
      return okJson([
        { id: null },
        {
          id: "stickers-foo-001",
          name: "Foo Sticker",
          set: "stickers",
          rarity: "holographic",
          sticker_img: "/img/stickers/foo.png",
        },
      ]);
    })
  );

  document.body.style.overflow = "scroll";

  const { unmount } = render(StickerInspect, { props: { slug: "foo" } });
  expect(document.body.style.overflow).toBe("hidden");

  // flip_on_click is forced on the inspect view.
  expect(await screen.findByLabelText("Flip card: Foo Sticker.")).toBeInTheDocument();

  unmount();
  expect(document.body.style.overflow).toBe("scroll");
});

test("StickerInspect falls back to matching full slug and normalizes leading/trailing slashes", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      okJson([
        {
          id: "stickers-bar-002",
          name: "Bar Sticker",
          set: "stickers",
          rarity: "common",
          sticker_img: "/img/stickers/bar.png",
        },
      ])
    )
  );

  render(StickerInspect, { props: { slug: "/bar-002/" } });
  expect(await screen.findByLabelText("Flip card: Bar Sticker.")).toBeInTheDocument();
});

test("StickerInspect renders nothing when the fetch response is not ok", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: false,
      json: async () => {
        throw new Error("should not be called");
      },
    }))
  );

  render(StickerInspect, { props: { slug: "missing" } });
  expect(screen.queryByLabelText(/Flip card:/)).toBe(null);
});

test("StickerInspect renders nothing when fetch throws", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new Error("network blocked");
    })
  );

  render(StickerInspect, { props: { slug: "missing" } });
  expect(screen.queryByLabelText(/Flip card:/)).toBe(null);
});
