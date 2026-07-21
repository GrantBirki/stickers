import { adjust, clamp, round } from "./helpers/Math.ts";

export type Theme = "light" | "dark";

export interface Interaction {
  backgroundX: number;
  backgroundY: number;
  glareX: number;
  glareY: number;
  rotateX: number;
  rotateY: number;
}

export const interactionFromPoint = (
  rect: Pick<DOMRect, "height" | "left" | "top" | "width">,
  clientX: number,
  clientY: number,
): Interaction => {
  const percentX = clamp(round((100 / rect.width) * (clientX - rect.left)));
  const percentY = clamp(round((100 / rect.height) * (clientY - rect.top)));
  return {
    backgroundX: adjust(percentX, 0, 100, 37, 63),
    backgroundY: adjust(percentY, 0, 100, 33, 67),
    glareX: percentX,
    glareY: percentY,
    rotateX: round(-((percentX - 50) / 3.5)),
    rotateY: round((percentY - 50) / 3.5),
  };
};

export const interactionFromOrientation = (gamma: number, beta: number): Interaction => {
  const x = clamp(gamma, -16, 16);
  const y = clamp(beta, -18, 18);
  return {
    backgroundX: adjust(x, -16, 16, 37, 63),
    backgroundY: adjust(y, -18, 18, 33, 67),
    glareX: adjust(x, -16, 16, 0, 100),
    glareY: adjust(y, -18, 18, 0, 100),
    rotateX: round(-x),
    rotateY: round(y),
  };
};

export const systemTheme = (windowRef: Window): Theme =>
  windowRef.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";

export const storedTheme = (storage: Pick<Storage, "getItem">, fallback: Theme): Theme => {
  try {
    const stored = storage.getItem("theme");
    return stored === "light" || stored === "dark" ? stored : fallback;
  } catch {
    return fallback;
  }
};

const setInteraction = (card: HTMLElement, interaction: Interaction, opacity = 1): void => {
  const distance = clamp(Math.hypot(interaction.glareY - 50, interaction.glareX - 50) / 50, 0, 1);
  card.style.setProperty("--pointer-x", `${interaction.glareX}%`);
  card.style.setProperty("--pointer-y", `${interaction.glareY}%`);
  card.style.setProperty("--pointer-from-center", distance.toString());
  card.style.setProperty("--pointer-from-top", (interaction.glareY / 100).toString());
  card.style.setProperty("--pointer-from-left", (interaction.glareX / 100).toString());
  card.style.setProperty("--card-opacity", opacity.toString());
  card.style.setProperty("--rotate-x", `${interaction.rotateX}deg`);
  card.style.setProperty("--rotate-y", `${interaction.rotateY}deg`);
  card.style.setProperty("--background-x", `${interaction.backgroundX}%`);
  card.style.setProperty("--background-y", `${interaction.backgroundY}%`);
};

const resetInteraction = (card: HTMLElement): void =>
  setInteraction(card, interactionFromPoint({ left: 0, top: 0, width: 100, height: 100 } as DOMRect, 50, 50), 0);

export const initializeTheme = (documentRef: Document, windowRef: Window): (() => void) => {
  const toggle = documentRef.querySelector<HTMLButtonElement>(".theme-toggle");
  if (!toggle) return () => {};
  const media = windowRef.matchMedia?.("(prefers-color-scheme: dark)");
  let locked = false;
  const apply = (theme: Theme): void => {
    documentRef.documentElement.dataset.theme = theme;
    toggle.setAttribute("aria-checked", String(theme === "dark"));
    toggle.querySelector<HTMLElement>(".theme-toggle__thumb")?.setAttribute("data-theme", theme);
  };
  try {
    const explicit = windowRef.localStorage.getItem("theme");
    locked = explicit === "light" || explicit === "dark";
    apply(storedTheme(windowRef.localStorage, systemTheme(windowRef)));
  } catch {
    apply(systemTheme(windowRef));
  }
  const onToggle = (): void => {
    const next: Theme = documentRef.documentElement.dataset.theme === "dark" ? "light" : "dark";
    locked = true;
    try { windowRef.localStorage.setItem("theme", next); } catch { /* Keep the in-memory choice. */ }
    apply(next);
  };
  const onSystemChange = (): void => { if (!locked) apply(systemTheme(windowRef)); };
  toggle.addEventListener("click", onToggle);
  media?.addEventListener?.("change", onSystemChange);
  return () => {
    toggle.removeEventListener("click", onToggle);
    media?.removeEventListener?.("change", onSystemChange);
  };
};

export const initializeCards = (documentRef: Document, windowRef: Window): (() => void) => {
  const cleanups: Array<() => void> = [];
  let active: HTMLElement | undefined;
  let orientationBase: { beta: number; gamma: number } | undefined;
  const inspectButton = documentRef.querySelector<HTMLAnchorElement>(".inspect-fab");
  const recenter = (card: HTMLElement): void => {
    const rect = card.getBoundingClientRect();
    const scale = Math.min((windowRef.innerWidth / rect.width) * 0.9, (windowRef.innerHeight / rect.height) * 0.9, 1.75);
    card.style.setProperty("--translate-x", `${round(windowRef.innerWidth / 2 - rect.x - rect.width / 2)}px`);
    card.style.setProperty("--translate-y", `${round(windowRef.innerHeight / 2 - rect.y - rect.height / 2)}px`);
    card.style.setProperty("--card-scale", scale.toString());
  };
  const deactivate = (): void => {
    if (!active) return;
    active.classList.remove("active", "interacting");
    active.closest(".card-grid")?.classList.remove("active");
    active.style.setProperty("--translate-x", "0px");
    active.style.setProperty("--translate-y", "0px");
    active.style.setProperty("--card-scale", "1");
    resetInteraction(active);
    active = undefined;
    orientationBase = undefined;
    if (inspectButton) inspectButton.hidden = true;
  };
  const activate = (card: HTMLElement): void => {
    if (active === card) return deactivate();
    deactivate();
    active = card;
    card.classList.add("active", "interacting");
    card.closest(".card-grid")?.classList.add("active");
    recenter(card);
    if (inspectButton && card.dataset.inspectHref) {
      inspectButton.href = card.dataset.inspectHref;
      inspectButton.hidden = false;
    }
  };

  for (const card of documentRef.querySelectorAll<HTMLElement>(".card")) {
    const button = card.querySelector<HTMLButtonElement>(".card__rotator");
    if (!button) continue;
    const onClick = (): void => {
      if (button.dataset.flipOnClick === "true") {
        const flipped = card.dataset.flipped !== "true";
        card.dataset.flipped = String(flipped);
        card.style.setProperty("--flip", flipped ? "180deg" : "0deg");
      } else activate(card);
    };
    const onPointerMove = (event: PointerEvent): void => {
      if (active && active !== card) return;
      card.classList.add("interacting");
      setInteraction(card, interactionFromPoint(button.getBoundingClientRect(), event.clientX, event.clientY));
    };
    const onPointerLeave = (): void => {
      if (active !== card) card.classList.remove("interacting");
      windowRef.setTimeout(() => resetInteraction(card), 120);
    };
    const onFocusOut = (event: FocusEvent): void => {
      const next = event.relatedTarget;
      if (next instanceof Element && next.closest('[data-inspect-button="true"]')) return;
      if (active === card) deactivate();
    };
    button.addEventListener("click", onClick);
    button.addEventListener("pointermove", onPointerMove);
    button.addEventListener("pointerleave", onPointerLeave);
    button.addEventListener("focusout", onFocusOut);
    cleanups.push(() => {
      button.removeEventListener("click", onClick);
      button.removeEventListener("pointermove", onPointerMove);
      button.removeEventListener("pointerleave", onPointerLeave);
      button.removeEventListener("focusout", onFocusOut);
    });
    for (const image of card.querySelectorAll<HTMLImageElement>(".card__face")) {
      const loaded = (): void => {
        card.classList.remove("loading");
        if (image.naturalWidth && image.naturalHeight) card.dataset.frontShape = Math.abs(image.naturalWidth / image.naturalHeight - 1) < 0.05 ? "square" : "rect";
      };
      if (image.complete) loaded(); else image.addEventListener("load", loaded, { once: true });
    }
    if (card.dataset.showcase === "true") {
      let radians = 0;
      const start = windowRef.setTimeout(() => {
        const interval = windowRef.setInterval(() => {
          radians += 0.05;
          setInteraction(card, { backgroundX: 20 + Math.sin(radians) * 20, backgroundY: 20 + Math.cos(radians) * 20, glareX: 55 + Math.sin(radians) * 55, glareY: 55 + Math.cos(radians) * 55, rotateX: Math.sin(radians) * 25, rotateY: Math.cos(radians) * 25 }, 0.8);
        }, 20);
        const stop = windowRef.setTimeout(() => { windowRef.clearInterval(interval); resetInteraction(card); }, 4000);
        cleanups.push(() => windowRef.clearTimeout(stop));
        cleanups.push(() => windowRef.clearInterval(interval));
      }, 2000);
      cleanups.push(() => windowRef.clearTimeout(start));
    }
  }

  const onScroll = (): void => { if (active) recenter(active); };
  const onOrientation = (event: DeviceOrientationEvent): void => {
    if (!active || event.gamma === null || event.beta === null) return;
    orientationBase ??= { gamma: event.gamma, beta: event.beta };
    setInteraction(active, interactionFromOrientation(event.gamma - orientationBase.gamma, event.beta - orientationBase.beta));
  };
  const onVisibility = (): void => { if (documentRef.visibilityState !== "visible") deactivate(); };
  windowRef.addEventListener("scroll", onScroll, { passive: true });
  windowRef.addEventListener("deviceorientation", onOrientation);
  documentRef.addEventListener("visibilitychange", onVisibility);
  if (documentRef.querySelector(".inspect")) documentRef.body.style.overflow = "hidden";
  return () => {
    deactivate();
    documentRef.body.style.overflow = "";
    windowRef.removeEventListener("scroll", onScroll);
    windowRef.removeEventListener("deviceorientation", onOrientation);
    documentRef.removeEventListener("visibilitychange", onVisibility);
    cleanups.forEach((cleanup) => cleanup());
  };
};
