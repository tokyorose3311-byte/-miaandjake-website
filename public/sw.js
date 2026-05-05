const CACHE_NAME = 'quest-for-wonders-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/game.html',
  '/manifest.json',
  '/background.png',
  '/quest_coloring_10.png',
  '/quest_fish_5_coloring.png',
  '/quest_coloring_map.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.allSettled(
          ASSETS.map(asset => 
            cache.add(asset).catch(() => console.log(`Skipped: ${asset}`))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(names => 
        Promise.all(
          names
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, response.clone()));
          return response;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request)
        .then(response => response || fetch(e.request))
        .catch(() => {
          if (e.request.destination === 'image') {
            return caches.match('/background.png');
          }
          return new Response('Offline', { status: 503 });
        })
    );
  }
});
