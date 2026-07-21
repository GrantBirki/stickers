import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.resolve(process.cwd(), "dist");
const port = Number(process.env.PORT || 5173);
const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

export const safePath = (requestPath: string): string | undefined => {
  let decoded: string;
  try { decoded = decodeURIComponent(requestPath.split("?", 1)[0] || "/"); }
  catch { return undefined; }
  const relative = decoded.replace(/^\/+/, "");
  const candidate = path.resolve(root, relative);
  return candidate === root || candidate.startsWith(`${root}${path.sep}`) ? candidate : undefined;
};

export const fileForRequest = (requestPath: string): string | undefined => {
  const candidate = safePath(requestPath);
  if (!candidate) return undefined;
  try {
    return fs.statSync(candidate).isDirectory() ? path.join(candidate, "index.html") : candidate;
  } catch {
    return undefined;
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  http.createServer((request, response) => {
    const file = fileForRequest(request.url || "/");
    if (!file || !fs.existsSync(file)) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found\n");
      return;
    }
    response.writeHead(200, {
      "cache-control": "no-cache",
      "content-type": contentTypes[path.extname(file).toLowerCase()] || "application/octet-stream",
    });
    fs.createReadStream(file).pipe(response);
  }).listen(port, "127.0.0.1", () => {
    console.log(`Serving dist/ at http://127.0.0.1:${port}`);
  });
}
