import { unmount } from "svelte";

import { test, expect, vi } from "./test-utils.ts";

test("main.ts throws when #app mount target is missing", async () => {
  document.body.innerHTML = "";

  await expect(import("../src/main.ts?missing-target")).rejects.toThrow("Missing #app mount target");
});

test("main.ts mounts the app when #app exists", async () => {
  document.body.innerHTML = '<div id="app"></div>';
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => ({
      ok: true,
      json: async () => (url.toString().endsWith("site.json") ? {} : []),
    })),
  );

  const mod = await import("../src/main.ts?mounted-app");
  expect(mod.default).toBeTruthy();
  expect(document.querySelector(".app")).not.toBe(null);
  unmount(mod.default);
});
