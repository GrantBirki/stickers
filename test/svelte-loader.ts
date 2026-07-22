import { readFile } from "node:fs/promises";
import { compile } from "svelte/compiler";

export async function load(
  url: string,
  context: object,
  nextLoad: (url: string, context: object) => Promise<unknown>,
) {
  if (!new URL(url).pathname.endsWith(".svelte")) {
    return nextLoad(url, context);
  }

  const source = (await readFile(new URL(url), "utf8")).replaceAll(
    "import.meta.env.BASE_URL",
    '(globalThis.__VITE_BASE_URL__ ?? "/")',
  );
  const compiled = compile(source, {
    filename: new URL(url).pathname,
    generate: "client",
    css: "injected",
    dev: true,
  });

  const sourceMap = Buffer.from(compiled.js.map.toString()).toString("base64");
  return {
    format: "module",
    shortCircuit: true,
    source: `${compiled.js.code}\n//# sourceMappingURL=data:application/json;base64,${sourceMap}`,
  };
}
