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
  "@sveltejs/vite-plugin-svelte": "7.0.0",
  jsdom: "29.1.1",
  svelte: "5.55.7",
  "svelte-check": "4.4.7",
  typescript: "6.0.3",
  vite: "8.0.16",
};

const approvedOverrides = {
  undici: "7.28.0",
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
