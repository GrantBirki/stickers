import { test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

import Card from "../src/lib/components/Card.svelte";
import { activeCard } from "../src/lib/stores/activeCard.js";
import { activeStickerId } from "../src/lib/stores/activeStickerId.js";

const setVisibility = (state) => {
  const original = Object.getOwnPropertyDescriptor(document, "visibilityState");
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
  return () => {
    if (original) {
      Object.defineProperty(document, "visibilityState", original);
    } else {
      // Best effort restore.
      // eslint-disable-next-line no-undefined
      delete document.visibilityState;
    }
  };
};

test("Card renders a sticker card with derived image URLs, metadata, and data attributes", async () => {
  const { container } = render(Card, {
    props: {
      id: "stickers-foo-001",
      name: "Foo",
      set: "stickers",
      number: "0001",
      types: ["Water"],
      rarity: "holographic",
      subtypes: ["Basic"],
      sticker_img: "img/stickers/foo.png",
      card_front_img: "img/card_front_texture.png",
      card_back_img: "img/back.png",
      drop_date: "2026-01-02",
      description: "First drop",
      total_prints: 10,
      mask: "mask.png",
      foil: "foil.png",
    },
  });

  const root = container.querySelector(".card");
  expect(root).not.toBe(null);
  expect(root).toHaveAttribute("data-set", "stickers");
  expect(root.className).toMatch(/water/);
  expect(root).toHaveAttribute("data-sticker-foil", "full");
  expect(root).toHaveAttribute("data-front-shape", "rect");
  expect(root.classList.contains("masked")).toBe(true);

  // Derived alt text and relative src normalization.
  const face = screen.getByAltText("Front image for the Foo card");
  expect(face.getAttribute("src")).toBe("/img/stickers/foo.png");

  const back = screen.getByAltText("The back of a trading card");
  expect(back.getAttribute("src")).toBe("/img/back.png");

  // Sticker metadata block.
  expect(screen.getByText("Foo")).toBeInTheDocument();
  expect(screen.getByText("2026/01/02")).toBeInTheDocument();
  expect(screen.getByText("First drop")).toBeInTheDocument();
  expect(screen.getByText("Total prints: 10")).toBeInTheDocument();
  expect(screen.getByText("0001")).toBeInTheDocument();

  // Front override styles (when card_front_img is provided for sticker cards).
  const front = container.querySelector(".card__front");
  expect(front.getAttribute("style")).toMatch(/--card-front-img:/);
  expect(front.getAttribute("style")).toMatch(/--front-texture-opacity: 0/);

  // Image loader toggles loading state and can detect square art.
  Object.defineProperty(face, "naturalWidth", { value: 100, configurable: true });
  Object.defineProperty(face, "naturalHeight", { value: 100, configurable: true });
  await fireEvent.load(face);

  await waitFor(() => expect(root.classList.contains("loading")).toBe(false));
  expect(root).toHaveAttribute("data-front-shape", "square");
  expect(front.getAttribute("style")).toMatch(/--mask: url\(mask\.png\)/);
  expect(front.getAttribute("style")).toMatch(/--foil: url\(foil\.png\)/);
});

test("Card renders a mystery sticker card using card_front_img and mystery markup", () => {
  render(Card, {
    props: {
      id: "stickers-mystery",
      name: "Mystery",
      set: "stickers",
      rarity: "holographic",
      variant: "mystery",
      card_front_img: "/img/mystery.png",
    },
  });

  const img = screen.getByAltText("A mystery card");
  expect(img.getAttribute("src")).toBe("/img/mystery.png");
});

test("Card uses absolute/data URLs as-is for non-sticker cards", () => {
  render(Card, {
    props: {
      id: "demo-1",
      name: "Demo",
      set: "demo",
      rarity: "common",
      card_front_img: "data:image/png;base64,AAAA",
      card_back_img: "http://example.com/back.png",
    },
  });

  const face = screen.getByAltText("Front image for the Demo card");
  expect(face.getAttribute("src")).toBe("data:image/png;base64,AAAA");

  const back = screen.getByAltText("The back of a trading card");
  expect(back.getAttribute("src")).toBe("http://example.com/back.png");
});

test("flip_on_click toggles without activating the global activeCard selection", async () => {
  const { container } = render(Card, {
    props: {
      id: "stickers-flip",
      name: "Flip",
      set: "stickers",
      rarity: "common",
      sticker_img: "/img/stickers/flip.png",
      flip_on_click: true,
    },
  });

  const button = await screen.findByLabelText("Flip card: Flip.");
  await fireEvent.click(button);

  expect(get(activeStickerId)).toBe(undefined);
  const root = container.querySelector(".card");
  expect(root.classList.contains("active")).toBe(false);
});

test("expanded cards self-activate on mount and clear stores on destroy", async () => {
  const { unmount, container } = render(Card, {
    props: {
      id: "stickers-expanded",
      name: "Expanded",
      set: "stickers",
      rarity: "common",
      sticker_img: "/img/stickers/expanded.png",
      expanded: true,
    },
  });

  await waitFor(() => expect(get(activeStickerId)).toBe("stickers-expanded"));
  expect(get(activeCard)).toBe(container.querySelector(".card"));

  unmount();
  expect(get(activeStickerId)).toBe(undefined);
  expect(get(activeCard)).toBe(undefined);
});

test("deactivate() does not collapse the card when focus moves to an inspect button", async () => {
  render(Card, {
    props: {
      id: "stickers-focus",
      name: "Focus",
      set: "stickers",
      rarity: "common",
      sticker_img: "/img/stickers/focus.png",
    },
  });

  const button = await screen.findByLabelText("Expand card: Focus.");

  await fireEvent.click(button);
  await waitFor(() => expect(get(activeStickerId)).toBe("stickers-focus"));

  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-inspect-button", "true");
  const inspectTarget = document.createElement("button");
  wrapper.appendChild(inspectTarget);
  document.body.appendChild(wrapper);

  await fireEvent.blur(button, { relatedTarget: inspectTarget });
  expect(get(activeStickerId)).toBe("stickers-focus");

  // When relatedTarget is null, fall back to document.activeElement.
  inspectTarget.focus();
  await fireEvent.blur(button, { relatedTarget: null });
  expect(get(activeStickerId)).toBe("stickers-focus");

  // Normal blur collapses.
  inspectTarget.blur();
  await fireEvent.blur(button, { relatedTarget: null });
  await waitFor(() => expect(get(activeStickerId)).toBe(undefined));
});

test("interact() is blocked when the page is hidden or when another card is active", async () => {
  const restore = setVisibility("hidden");

  try {
    const { container } = render(Card, {
      props: {
        id: "stickers-interact",
        name: "Interact",
        set: "stickers",
        rarity: "common",
        sticker_img: "/img/stickers/interact.png",
      },
    });

    const button = await screen.findByLabelText("Expand card: Interact.");
    const root = container.querySelector(".card");

    // Mark as hidden and notify the component.
    document.dispatchEvent(new Event("visibilitychange"));
    await fireEvent.pointerMove(button, { clientX: 10, clientY: 10 });
    expect(root.classList.contains("interacting")).toBe(false);
  } finally {
    restore();
  }

  // Another active card should block interaction.
  const { container: c1 } = render(Card, {
    props: {
      id: "stickers-a",
      name: "A",
      set: "stickers",
      rarity: "common",
      sticker_img: "/img/stickers/a.png",
    },
  });
  const { container: c2 } = render(Card, {
    props: {
      id: "stickers-b",
      name: "B",
      set: "stickers",
      rarity: "common",
      sticker_img: "/img/stickers/b.png",
    },
  });

  const a = await screen.findByLabelText("Expand card: A.");
  const b = await screen.findByLabelText("Expand card: B.");
  await fireEvent.click(a);

  const rootB = c2.querySelector(".card");
  await fireEvent.pointerMove(b, { clientX: 10, clientY: 10 });
  expect(rootB.classList.contains("interacting")).toBe(false);
});

test("pointer/touch interaction schedules animation work and is cancelled on mouseout", async () => {
  vi.useFakeTimers();

  try {
    render(Card, {
      props: {
        id: "stickers-raf",
        name: "RAF",
        set: "stickers",
        rarity: "common",
        sticker_img: "/img/stickers/raf.png",
      },
    });

    const button = await screen.findByLabelText("Expand card: RAF.");
    button.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      width: 100,
      height: 200,
    });

    await fireEvent.pointerMove(button, { clientX: 10, clientY: 20 });
    // Second move should hit the "raf already scheduled" path.
    await fireEvent.pointerMove(button, { clientX: 20, clientY: 30 });

    await fireEvent.touchMove(button, { touches: [{ clientX: 12, clientY: 34 }] });

    // Cancels any pending RAF and schedules spring reset.
    await fireEvent.mouseOut(button);
    vi.runOnlyPendingTimers();
  } finally {
    vi.useRealTimers();
  }
});
