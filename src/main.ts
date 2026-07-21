import { initializeCards, initializeTheme } from "./lib/browser.ts";

export const start = (documentRef: Document, windowRef: Window): (() => void) => {
  const stopTheme = initializeTheme(documentRef, windowRef);
  const stopCards = initializeCards(documentRef, windowRef);
  return () => {
    stopCards();
    stopTheme();
  };
};

if (typeof document !== "undefined" && typeof window !== "undefined") start(document, window);
