import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
const root = resolve(process.cwd());
const port = process.env.PORT || 4173;
const contentTypes = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost:" + port);
    const requestedPath = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const filePath = resolve(join(root, requestedPath));
    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    const body = await readFile(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});
server.listen(port, () => console.log("Prototype available at http://localhost:" + port));
