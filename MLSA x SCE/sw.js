// Service Worker — MLSA × SCE
// Caches critical assets and serves offline.html when network is unavailable.

const CACHE_NAME = "mlsa-sce-v1";
const OFFLINE_URL = "/offline.html";

// Assets to pre-cache on install
const PRE_CACHE = [
  OFFLINE_URL,
  "/assets/mlsa-badge.png",
  "/manifest.json",
  "/js/error-boundary.js"
];

// Install: cache offline page
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRE_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from network, fallback to offline page for navigation requests
self.addEventListener("fetch", (event) => {
  // Only handle navigation requests (HTML pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  }
});
