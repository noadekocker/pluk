// Bewaart de app op je toestel zodat hij ook zonder internet werkt.
// Pas je iets aan? Verhoog dan het versienummer hieronder.
const CACHE = 'pluk-v3';
const FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./prompts.js",
    "./manifest.webmanifest",
    "./assets/apple-touch-icon.png",
    "./assets/card-face.svg",
    "./assets/count-off-1.svg",
    "./assets/count-off-2.svg",
    "./assets/count-off-3.svg",
    "./assets/count-on-1.svg",
    "./assets/count-on-2.svg",
    "./assets/count-on-3.svg",
    "./assets/favicon-32.png",
    "./assets/icon-192.png",
    "./assets/icon-512.png",
    "./assets/krijt-lemon-off.svg",
    "./assets/krijt-lemon.svg",
    "./assets/krijt-orange.svg",
    "./assets/krijt-pear.svg",
    "./assets/krijt-table.svg",
    "./assets/krijt-wall.svg",
    "./assets/main-cloud-l.svg",
    "./assets/main-cloud-r.svg",
    "./assets/main-daisy-big.svg",
    "./assets/main-daisy-small.svg",
    "./assets/main-grass.svg",
    "./assets/main-tuft1.svg",
    "./assets/main-tuft2.svg",
    "./assets/main-tuft3.svg",
    "./assets/sparkle.svg",
    "./assets/sparkle-on.svg",
    "./assets/sparkle-off.svg",
    "./assets/tuin-cloud-l.svg",
    "./assets/tuin-cloud-r.svg",
    "./assets/tuin-flowers-1.svg",
    "./assets/tuin-flowers-2.svg",
    "./assets/tuin-flowers-3.svg",
    "./assets/tuin-flowers-4.svg",
    "./assets/tuin-flowers-5.svg",
    "./assets/tuin-grass.svg",
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      // lettertypes van Google ook bewaren voor offline gebruik
      if (res.ok && e.request.url.startsWith('https://fonts.')) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }))
  );
});
