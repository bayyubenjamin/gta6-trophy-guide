// serve.ts — static file server for the Leonida Trophy Guide.
// Serves app/ at its root on http://localhost:8080 so the guide can be
// opened in a desktop browser and screenshotted. Run it as `node serve.ts`
// from the repository root. No build step, no network calls.

import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const appDir = resolve(import.meta.dirname, "app");
const port = Number(process.env.PORT || 8080);

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

function safePath(urlPath: string): string | null {
  const cleaned = decodeURIComponent(urlPath.split("?")[0]);
  const rel = cleaned === "/" ? "index.html" : cleaned.replace(/^\/+/, "");
  const resolved = resolve(appDir, normalize(rel));
  if (!resolved.startsWith(appDir + "/") && resolved !== appDir) return null;
  return resolved;
}

const server = createServer((req, res) => {
  let target = safePath(req.url || "/");
  if (target && existsSync(target) && statSync(target).isDirectory()) {
    target = join(target, "index.html");
  }
  if (!target || !existsSync(target) || !statSync(target).isFile()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found\n");
    return;
  }
  const type = MIME[extname(target).toLowerCase()] || "application/octet-stream";
  res.writeHead(200, { "content-type": type });
  res.end(readFileSync(target));
});

server.listen(port);
