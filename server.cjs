// Servidor local sin dependencias. Ejecuta npm run dev.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = __dirname;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".mp3": "audio/mpeg" };
const server = http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
  catch { response.writeHead(400).end("Solicitud inválida"); return; }
  const file = path.resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
  const relative = path.relative(root, file);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !types[path.extname(file)]) {
    response.writeHead(404).end("No encontrado"); return;
  }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404).end("No encontrado"); return; }
    response.writeHead(200, { "Content-Type": types[path.extname(file)], "Cache-Control": "no-store" });
    response.end(data);
  });
});
server.listen(Number(process.env.PORT) || 4173, "127.0.0.1", () => {
  console.log(`Local: http://localhost:${server.address().port}`);
});
