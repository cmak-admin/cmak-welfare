/* CMAK Welfare shell service worker.
   It caches ONLY this shell's own static files (page, styles, script,
   icons) so the app opens instantly and can show an offline message.
   It never sees or stores register data: the register is a cross-origin
   frame from Google, which a service worker does not intercept, and any
   request to another origin is left alone. Bump VERSION on every release. */
'use strict';
var VERSION = 'cmak-shell-2026-11-a';
var FILES = ['./', 'index.html', 'shell.css', 'shell.js', 'config.js', 'manifest.webmanifest',
  'icons/favicon.ico', 'icons/favicon-32.png', 'icons/favicon-96.png', 'icons/emblem-mark-256.png',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-192.png', 'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  /* network first, so a new release shows on the next open; cache only as a fallback */
  e.respondWith(fetch(req).then(function (res) {
    if (res && res.ok && res.type === 'basic') {
      var copy = res.clone();
      caches.open(VERSION).then(function (c) { c.put(req, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: req.mode === 'navigate' }).then(function (hit) {
      return hit || caches.match('index.html');
    });
  }));
});
