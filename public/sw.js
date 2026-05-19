/* DevBench PWA — static assets + optional workspace shells (no HTML/RSC cache). */
const CACHE_STATIC = "devbench-static-v2";
const CACHE_SHELL = "devbench-shell-v2";

const SHELL_PATHS = ["/", "/json", "/pdf", "/workflows", "/vault", "/api-tester"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_SHELL)
      .then((cache) =>
        cache.addAll(SHELL_PATHS).catch(() => {
          /* shells may fail offline on first install — ok */
        }),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_STATIC && k !== CACHE_SHELL)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(CACHE_STATIC, req));
    return;
  }

  if (url.pathname.startsWith("/workers/")) {
    event.respondWith(cacheFirst(CACHE_STATIC, req));
    return;
  }

  if (
    SHELL_PATHS.includes(url.pathname) &&
    req.headers.get("accept")?.includes("text/html")
  ) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_SHELL).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(() => caches.match(req).then((r) => r ?? caches.match("/"))),
    );
  }
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "CACHE_URLS" || !Array.isArray(data.urls)) return;
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) =>
      Promise.all(
        data.urls.map((url) =>
          fetch(url, { mode: "no-cors" }).then((res) => {
            if (res.ok || res.type === "opaque") {
              try {
                return cache.put(url, res);
              } catch {
                return undefined;
              }
            }
          }),
        ),
      ),
    ),
  );
});

function cacheFirst(cacheName, req) {
  return caches.open(cacheName).then((cache) =>
    cache.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res.ok && res.type === "basic") {
          try {
            cache.put(req, res.clone());
          } catch {
            /* ignore */
          }
        }
        return res;
      });
    }),
  );
}
