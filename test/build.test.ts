import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

import { fileForRequest, safePath } from "../scripts/server.mts";

const root = process.cwd();

test("build emits every direct-link route and browser asset", () => {
  for (const file of [
    "dist/index.html",
    "dist/examples/index.html",
    "dist/about/index.html",
    "dist/stickers/mike-mike-dms/index.html",
    "dist/assets/main.js",
    "dist/css/cards/all.css",
  ]) assert.equal(fs.existsSync(path.join(root, file)), true, file);

  const home = fs.readFileSync(path.join(root, "dist/index.html"), "utf8");
  const cardCss = fs.readFileSync(path.join(root, "dist/css/cards/all.css"), "utf8");
  assert.match(home, /Sticker Drops/);
  assert.doesNotMatch(home, /src\/main\.ts|svelte|vite/i);
  assert.match(cardCss, /--pop-rotate/);
  assert.match(cardCss, /\.card\.flipping \.card__rotator/);
  assert.match(cardCss, /\.card\.activating \.card__translater[^}]+1200ms/);
  assert.match(cardCss, /\.card\.activating \.card__rotator[^}]+1200ms/);
});

test("the development server resolves direct routes and rejects traversal", () => {
  assert.equal(fileForRequest("/stickers/mike-mike-dms/"), path.join(root, "dist/stickers/mike-mike-dms/index.html"));
  assert.equal(safePath("/../../package.json"), undefined);
  assert.equal(safePath("/%E0%A4%A"), undefined);
  assert.equal(fileForRequest("/missing"), undefined);
});

test("lockfile contains one resolved package", () => {
  const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8")) as { packages: Record<string, unknown> };
  assert.deepEqual(Object.keys(lock.packages), ["", "node_modules/typescript"]);
});
