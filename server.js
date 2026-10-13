// 依存なしのローカル開発サーバー（ファイル保存で自動リロード）
// 使い方: node server.js   → http://localhost:5173
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 5173;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".ico": "image/x-icon",
};
const RELOAD = `<script>new EventSource("/__reload").onmessage=()=>location.reload()</script>`;

// Windows はファイルを読んだだけでも変更通知が来るので、HTML/CSS/JS の更新日時が変わったときだけリロードする
const clients = new Set();
const mtimes = new Map();
let timer = null;
fs.watch(ROOT, { recursive: true }, (_e, file) => {
  if (!file || !/\.(html|css|js)$/i.test(file) || /^(node_modules|\.git)[\\/]/.test(file)) return;
  let m;
  try { m = fs.statSync(path.join(ROOT, file)).mtimeMs; } catch { return; }
  if (mtimes.get(file) === m) return;
  mtimes.set(file, m);
  clearTimeout(timer);
  timer = setTimeout(() => clients.forEach(res => res.write("data: reload\n\n")), 150);
});

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  if (url === "/__reload") {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
    res.write("\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }
  let file = path.join(ROOT, url.endsWith("/") ? url + "index.html" : url);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404).end("Not found"); return; }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(ext === ".html" ? buf.toString().replace("</body>", RELOAD + "</body>") : buf);
  });
}).listen(PORT, () => console.log(`Wedding site: http://localhost:${PORT}`));
