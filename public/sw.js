/**
 * TerraVista AI — Service Worker
 * Strategy:
 *   - Static assets & pages: Cache-first (fast loads, offline shell)
 *   - API / Supabase requests: Network-first (always fresh data)
 *   - Images: Cache-first with stale-while-revalidate
 */

const CACHE_VERSION = "terravista-v2";
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const IMAGE_CACHE   = `${CACHE_VERSION}-images`;
const API_CACHE     = `${CACHE_VERSION}-api`;

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
];

const API_DOMAINS = ["supabase.co", "supabase.in", "functions.supabase.co"];
const VITE_CHUNK_PATH = "/node_modules/.vite/";

// ── Install: pre-cache shell ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("terravista-") && ![STATIC_CACHE, IMAGE_CACHE, API_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: routing logic ──
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== "GET" || url.protocol === "chrome-extension:") return;

  // Never cache Vite dev/preview dependency chunks
  if (url.pathname.includes(VITE_CHUNK_PATH)) {
    event.respondWith(fetch(request));
    return;
  }

  // API / Supabase → Network-first
  if (API_DOMAINS.some((d) => url.hostname.includes(d))) {
    event.respondWith(networkFirst(request, API_CACHE, 5000));
    return;
  }

  // Images → Cache-first with background revalidation
  if (request.destination === "image") {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }

  // HTML pages → Network-first (fresh, but fall back to cache for offline)
  if (request.destination === "document" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(request, STATIC_CACHE, 3000));
    return;
  }

  // JS/CSS/fonts → Cache-first
  event.respondWith(cacheFirst(request, STATIC_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request, cacheName, timeoutMs = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    clearTimeout(timer);
    const cached = await caches.match(request);
    if (cached) return cached;
    // For HTML pages, return the cached index as fallback shell
    if (request.destination === "document") {
      return caches.match("/index.html") || new Response("Offline", { status: 503 });
    }
    return new Response("Offline", { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  const networkFetch = fetch(request).then((response) => {
    if (response.ok) {
      caches.open(cacheName).then((cache) => cache.put(request, response.clone()));
    }
    return response;
  }).catch(() => null);
  return cached || (await networkFetch) || new Response("Offline", { status: 503 });
}

// ── Push notifications ──
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data;
  try { data = event.data.json(); } catch { data = { title: "TerraVista", body: event.data.text() }; }
  event.waitUntil(
    self.registration.showNotification(data.title || "TerraVista", {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-72.png",
      data: { url: data.url || "/" },
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const url = event.notification.data?.url || "/";
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
