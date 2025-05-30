const CACHE_NAME = 'podcast-player-v1';
// Get the base path from the service worker scope
const BASE_PATH = self.registration.scope.replace(/\/$/, '');

const ASSETS_TO_CACHE = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/offline.html`,
  `${BASE_PATH}/css/styles.css`,
  `${BASE_PATH}/css/console.css`,
  `${BASE_PATH}/js/main.bundle.js`,
  `${BASE_PATH}/wasm/podcast_player.js`,
  `${BASE_PATH}/wasm/podcast_player_bg.wasm`
];

// Install service worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Serve from cache, falling back to network
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        // Try network and cache the result
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache the fetched response
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        }).catch(() => {
          // If the request is for an HTML page, return the offline page
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match(`${BASE_PATH}/offline.html`);
          }
        });
      })
  );
});