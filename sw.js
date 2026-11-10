var CACHE = 'lectura-articole-v1';
var FILES = [
  '/lectura-articole/',
  '/lectura-articole/index.html',
  '/lectura-articole/manifest.json',
  '/lectura-articole/icon-192.png',
  '/lectura-articole/icon-512.png'
];


self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Ignoră cererile către Google API pentru cache local
  if (e.request.url.includes('googleapi')) {
    return fetch(e.request);
  }

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(resp) {
        // Punem în cache doar fișierele proprii valide
        if (resp && resp.status === 200 && resp.type === 'basic') {
          var clone = resp.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return resp;
      });
    }).catch(function() {
      return caches.match('./index.html');
    })
  );
});


