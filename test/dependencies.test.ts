import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

type DependencyMap = Record<string, string>;

type PackageJson = {
  name: string;
  version: string;
  dependencies?: DependencyMap;
  devDependencies?: DependencyMap;
  overrides?: DependencyMap;
};

type PackageLock = {
  name: string;
  version: string;
  packages: Record<string, PackageJson>;
};

const approvedDevDependencies = {
  "@sveltejs/vite-plugin-svelte": "7.3.0",
  jsdom: "29.1.1",
  svelte: "5.56.9",
  "svelte-check": "4.7.6",
  typescript: "6.0.3",
  vite: "8.2.1",
};

const approvedOverrides = {
  "@emnapi/core": "1.11.0",
  "@emnapi/runtime": "1.11.0",
  devalue: "5.9.3",
  nanoid: "3.3.18",
  postcss: "8.5.23",
  "source-map-js": "1.2.2",
  undici: "7.29.1",
};

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, "utf8")) as T;

test("the npm dependency boundary stays exact-pinned and bounded", () => {
  const packageJson = readJson<PackageJson>("package.json");
  const packageLock = readJson<PackageLock>("package-lock.json");
  const lockRoot = packageLock.packages[""];

  assert.equal(packageJson.dependencies, undefined);
  assert.equal(lockRoot.dependencies, undefined);
  assert.deepEqual(packageJson.devDependencies, approvedDevDependencies);
  assert.deepEqual(lockRoot.devDependencies, approvedDevDependencies);
  assert.deepEqual(packageJson.overrides, approvedOverrides);

  assert.equal(packageLock.name, packageJson.name);
  assert.equal(packageLock.version, packageJson.version);
  assert.equal(lockRoot.name, packageJson.name);
  assert.equal(lockRoot.version, packageJson.version);

  for (const version of [...Object.values(approvedDevDependencies), ...Object.values(approvedOverrides)]) {
    assert.match(version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
  }

  const resolvedPackageCount = Object.keys(packageLock.packages).filter(Boolean).length;
  assert.ok(resolvedPackageCount <= 115, `resolved dependency graph grew to ${resolvedPackageCount} packages`);
});

// Both PostCSS and css-tree must resolve the patched source-map implementation.
test("all source-map-js lockfile entries use the patched release", () => {
  const packageLock = readJson<PackageLock>("package-lock.json");
  const sourceMaps = Object.entries(packageLock.packages).filter(([path]) => path.endsWith("/source-map-js"));

  assert.ok(sourceMaps.length > 0, "source-map-js must be present in the build dependency graph");
  for (const [path, entry] of sourceMaps) {
    assert.equal(entry.version, approvedOverrides["source-map-js"], `${path} must resolve the patched version`);
  }
});
