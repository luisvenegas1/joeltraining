// Service worker de la PWA.
// REGLA CLAVE: solo cachea archivos ESTÁTICOS del MISMO origen (HTML/JS/CSS/imágenes).
// NUNCA cachea llamadas a Supabase ni a ninguna API/tercero, por dos motivos:
//   1) los datos deben venir siempre frescos (rutinas, ejercicios, etc.),
//   2) evitar que en un dispositivo compartido se sirva a un usuario la respuesta
//      cacheada de otro (fuga de datos).
const CACHE_NAME = "jh-training-v2"; // bump: invalida el caché viejo (v1 cacheaba de más)

const ASSETS_TO_CACHE = ["/", "/index.html"];

// Install: cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate: borra caches viejos (incluye el v1 que cacheaba respuestas de Supabase)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: solo assets del MISMO origen. Supabase/APIs/terceros van directo a la red.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Todo lo que no sea del propio dominio (Supabase, storage, etc.) NO pasa por el
  // service worker: se resuelve normal contra la red, siempre fresco y sin cachear.
  if (url.origin !== self.location.origin) return;

  // Network-first para los assets propios: intenta red, cachea copia; si no hay red,
  // sirve del caché (y index.html para navegación offline).
  event.respondWith(
    fetch(req)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone));
        return response;
      })
      .catch(() =>
        caches.match(req).then((cached) => {
          if (cached) return cached;
          if (req.mode === "navigate") return caches.match("/index.html");
          return undefined;
        })
      )
  );
});
