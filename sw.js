/* ==========================================================
   sw.js — "Service Worker" : un petit programme que le téléphone
   garde en arrière-plan. Il sert à deux choses :
   1) faire marcher l'appli SANS internet (on garde les fichiers en mémoire)
   2) afficher les notifications de rappel
   Si tu modifies un fichier du projet, change le numéro de version
   ci-dessous (v1 → v2) pour que le téléphone récupère la nouvelle version.
   ========================================================== */
const CACHE = 'todo-aurore-v1';

const FICHIERS = [
  './',
  'index.html',
  'styles.css',
  'script.js',
  'manifest.json',
  'Images/van.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'oiseau.mp3'
];

// Installation : on met les fichiers en mémoire.
// (Un fichier absent, comme oiseau.mp3, ne bloque pas le reste.)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(FICHIERS.map(f => c.add(f).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

// Activation : on supprime les anciennes versions
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(cles => Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// À chaque chargement : internet d'abord (pour avoir la dernière version),
// et si pas de réseau, on utilise la copie gardée en mémoire.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(rep => {
        if (rep.ok && new URL(e.request.url).origin === location.origin) {
          const copie = rep.clone();
          caches.open(CACHE).then(c => c.put(e.request, copie));
        }
        return rep;
      })
      .catch(() => caches.match(e.request).then(rep => rep || caches.match('index.html')))
  );
});

// Toucher une notification ouvre (ou ramène) l'appli
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(liste => {
      for (const c of liste) {
        if ('focus' in c) return c.focus();
      }
      return clients.openWindow('./');
    })
  );
});
