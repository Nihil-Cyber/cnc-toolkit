/* =========================================================
 * CNC 工程師工具包 — Service Worker(離線快取)
 * 改動任何 app 檔案後,把 CACHE 版本號 +1 即可強制更新快取
 * ========================================================= */
const CACHE = "cnc-toolkit-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./CHANGELOG.md",
  "./css/style.css",
  "./js/version.js",
  "./js/i18n.js",
  "./js/i18n-ref.js",
  "./js/data.js",
  "./js/ref-data.js",
  "./js/calc.js",
  "./js/export.js",
  "./js/shop.js",
  "./js/app.js",
  "./version.json",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return; // 只快取同源資源

  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          // 離線且未快取:導覽請求回退到首頁
          if (req.mode === "navigate") return caches.match("./index.html");
          return Response.error();
        });
    })
  );
});
