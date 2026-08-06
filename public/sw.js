const CACHE_NAME = 'concurseiro-focado-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/favicon.ico',
];

// Self-unregister if active on localhost / dev environment
if (typeof self !== 'undefined' && self.location && (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1')) {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      self.registration.unregister().then(() => {
        return self.clients.matchAll();
      }).then((clients) => {
        clients.forEach((client) => {
          if (client.url && client.navigate) {
            client.navigate(client.url);
          }
        });
      })
    );
  });
}

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass Service Worker completely on localhost / dev mode or for Next.js internal routes
  if (
    request.method !== 'GET' || 
    !url.protocol.startsWith('http') ||
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.includes('webpack')
  ) {
    return;
  }

  // Network-first strategy for navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match('/');
          });
        })
    );
    return;
  }

  // Cache-first strategy for static assets (images, styles, scripts, fonts)
  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/icons/')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch updated version in background (stale-while-revalidate)
          fetch(request).then((response) => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
            }
          }).catch(() => {});
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        }).catch((err) => {
          console.warn('SW fetch fallback:', err);
          return caches.match(request);
        });
      })
    );
    return;
  }

  // Default network fetch with cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
