// Tools By JRN - service worker
// Pages, scripts, styles and the manifest are fetched network-first, so updates
// show up without bumping the cache name. The cache is only an offline backup.
const CACHE = 'toolsbyjrn-v2';
const CORE = [
  '/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png',
  '/css/styles.css',
  '/js/icons.js',
  '/js/tools/pdfcompressor.js',
  '/js/tools/diu-lab-cover-page.js',
  '/js/tools/image2pdf.js',
  '/js/tools/merge-pdf.js',
  '/js/tools/diu-cover-page.js',
  '/js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Try the network first (always revalidated), save a copy, and fall back to the saved copy offline.
function networkFirst(req, fallbackUrl) {
  return fetch(req, { cache: 'no-cache' })
    .then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    })
    .catch(() =>
      caches.match(req).then((r) => r || (fallbackUrl && caches.match(fallbackUrl)) || Response.error())
    );
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Pages: network-first, fall back to the saved page (or the home page) offline.
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, '/index.html'));
    return;
  }

  // Scripts, styles and the manifest: network-first, so edits show up right away.
  if (/\.(js|css|json)$/.test(url.pathname)) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Everything else (images, icons): cache-first.
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
      );
    })
  );
});
