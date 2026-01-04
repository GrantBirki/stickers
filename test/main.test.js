import { test, expect, vi, beforeEach } from "vitest";

// main.js imports mount from "svelte"; mock it so we can assert calls without
// booting the whole app in unit tests.
vi.mock("svelte", async () => {
  const actual = await vi.importActual("svelte");
  return {
    ...actual,
    mount: vi.fn(() => ({ mocked: true })),
  };
});

beforeEach(() => {
  vi.resetModules();
});

test("main.js throws when #app mount target is missing", async () => {
  document.body.innerHTML = "";

  await expect(import("../src/main.js")).rejects.toThrow("Missing #app mount target");
});

test("main.js mounts the app when #app exists", async () => {
  document.body.innerHTML = '<div id="app"></div>';

  const svelte = await import("svelte");
  svelte.mount.mockClear();

  const mod = await import("../src/main.js");
  expect(mod.default).toEqual({ mocked: true });
  expect(svelte.mount).toHaveBeenCalledTimes(1);

  const target = document.getElementById("app");
  expect(svelte.mount.mock.calls[0][1]).toEqual({ target });
});

