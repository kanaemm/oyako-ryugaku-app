const ROOT = new URL(self.registration.scope).pathname;
const CACHE = `oyako-${ROOT}-v2`;
const local = path => `${ROOT}${path}`;
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['', 'tasks.json', 'icon.svg', 'manifest.webmanifest'].map(local))));
});
self.addEventListener('activate', event => {
 event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(`oyako-${ROOT}-`) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
 const url = new URL(event.request.url);
 if(event.request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(ROOT) || url.pathname.startsWith('/@') || url.pathname.startsWith('/src/') || url.pathname.includes('node_modules')) return;
 event.respondWith(fetch(event.request).then(response => {
 if(response.ok) { const copy=response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request,copy))); }
 return response;
 }).catch(async () => (await caches.match(event.request)) || (event.request.mode === 'navigate' ? await caches.match(local('')) : Response.error())));
});
