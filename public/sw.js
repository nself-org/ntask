const CACHE_NAME = 'app-cache-v1';
const STATIC_ASSETS = ['/', '/manifest.json'];
const API_CACHE_NAME = 'api-cache-v1';
const API_CACHE_TTL = 1000 * 60 * 5;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (url.pathname.startsWith('/api/') || url.pathname.includes('/functions/') || url.pathname.includes('/graphql')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE_NAME, API_CACHE_TTL));
    return;
  }

  if (request.destination === 'document' || request.destination === 'script' || request.destination === 'style' || request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
});

async function networkFirstWithCache(request, cacheName, ttl) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const clone = response.clone();
      const headers = new Headers(clone.headers);
      headers.set('x-cache-time', Date.now().toString());
      const body = await clone.blob();
      cache.put(request, new Response(body, { status: clone.status, statusText: clone.statusText, headers }));
    }
    return response;
  } catch {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) {
      const cacheTime = parseInt(cached.headers.get('x-cache-time') || '0');
      if (Date.now() - cacheTime < ttl) return cached;
    }
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}
