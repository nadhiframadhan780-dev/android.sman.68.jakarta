// ============================================================
// Service Worker — SMAN 68 Jakarta
// Versi: 1.0.0
// ============================================================

const CACHE_NAME = 'sman68-cache-v1';
const OFFLINE_URL = '/offline.html';

// Daftar file yang di-cache saat install (App Shell)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/sman68.html',
  '/sman68.css',
  '/sman68.js',
  '/styles.css',
  '/scripts.js',
  '/manifest.json'
];

// ── INSTALL ──────────────────────────────────────────────────
// Pre-cache App Shell saat service worker pertama kali dipasang
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching App Shell...');
      // addAll akan gagal jika salah satu URL tidak bisa diakses;
      // gunakan Promise.allSettled agar tidak memblokir instalasi
      return Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) =>
            console.warn('[SW] Gagal cache:', url, err)
          )
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────
// Hapus cache lama agar tidak memakai storage berlebih
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Menghapus cache lama:', name);
            return caches.delete(name);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ────────────────────────────────────────────────────
// Strategi: Network-first untuk HTML, Cache-first untuk aset statis
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Abaikan request non-HTTP (misalnya chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // Abaikan request ke domain eksternal selain yang diperlukan
  // (Firebase, Google Fonts, CDN) — biarkan browser menangani
  const isExternal = url.origin !== self.location.origin;
  if (isExternal) return;

  // Navigasi halaman → Network-first, fallback ke cache, lalu offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Simpan salinan segar ke cache
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached || caches.match(OFFLINE_URL)
          )
        )
    );
    return;
  }

  // Aset statis (CSS, JS, gambar, font lokal) → Cache-first, fallback network
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        });
      })
    );
    return;
  }

  // Default → network saja
  event.respondWith(fetch(request));
});
