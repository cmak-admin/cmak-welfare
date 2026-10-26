/* CMAK Welfare — installable app shell.
   The register itself (data, PINs, sessions) stays in Google Apps Script.
   This page only gives it a home: an icon, its own window, an install
   button and an honest offline message. It stores no member data. */
(function () {
  'use strict';
  var cfg = window.CMAK_CONFIG || {};
  var url = String(cfg.appsScriptUrl || '');
  var ok = /^https:\/\/script\.google\.com\/(a\/macros\/[A-Za-z0-9.-]+|macros)\/s\/[A-Za-z0-9_-]{20,}\/exec$/.test(url) || cfg.allowTestUrl === url;
  var $ = function (id) { return document.getElementById(id); };
  var frame = $('app'), splash = $('splash'), offline = $('offline');

  function standalone() {
    try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; }
  }

  /* ── the register ── */
  var loaded = false;
  function open() {
    if (!ok) { splash.hidden = true; $('setupMsg').hidden = false; return; }
    if (!navigator.onLine) { showOffline(); return; }
    offline.hidden = true; splash.hidden = false; loaded = false;
    frame.src = url;
    setTimeout(function () { if (!loaded) $('splashText').textContent = 'Still opening… a slow connection can take a little while.'; }, 12000);
  }
  frame.addEventListener('load', function () {
    if (!frame.src) return;
    loaded = true;
    setTimeout(function () { splash.hidden = true; }, 350);
  });
  function showOffline() { offline.hidden = false; splash.hidden = true; }
  window.addEventListener('offline', showOffline);
  window.addEventListener('online', function () { if (!offline.hidden) open(); });
  $('retryBtn').addEventListener('click', open);
  open();

  /* ── install ── */
  var bar = $('bar'), deferred = null;
  var dismissed = false;
  try { dismissed = localStorage.getItem('cmak.shell.barDismissed') === '1'; } catch (e) { }
  var ua = navigator.userAgent || '';
  var ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var iosSafari = ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();               /* show our own button instead of the mini-infobar */
    deferred = e;
    if (!standalone() && !dismissed) { $('installBtn').hidden = false; bar.hidden = false; }
  });
  $('installBtn').addEventListener('click', function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.then(function () { deferred = null; bar.hidden = true; });
  });
  window.addEventListener('appinstalled', function () { bar.hidden = true; });
  if (iosSafari && !standalone() && !dismissed) {
    $('barText').textContent = 'Add CMAK Welfare to your Home Screen';
    $('howBtn').hidden = false; bar.hidden = false;
  }
  $('howBtn').addEventListener('click', function () { $('iosHelp').hidden = false; $('iosClose').focus(); });
  $('iosClose').addEventListener('click', function () { $('iosHelp').hidden = true; });
  $('barClose').addEventListener('click', function () {
    bar.hidden = true;
    try { localStorage.setItem('cmak.shell.barDismissed', '1'); } catch (e) { }
  });

  /* ── updates: the shell's own files only ── */
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js', { scope: './' }).then(function (reg) {
      reg.addEventListener('updatefound', function () {
        var w = reg.installing;
        if (w) w.addEventListener('statechange', function () {
          if (w.state === 'activated' && navigator.serviceWorker.controller) $('splashText').textContent = 'Updated.';
        });
      });
    }).catch(function () { /* the app still works without it */ });
  }
})();
