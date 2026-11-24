/* PDF Libre – Service Worker
 *
 * Ersetzt auch den alten Push-Werbe-Service-Worker der früheren Domain (gleiche Adresse /sw.js,
 * dieser hier kennt keine Push-Nachrichten).
 *
 * Bewusst KEIN Zwischenspeicher für Seiten oder Skripte (sonst sähe man nach einem Update alte Versionen).
 * Er macht nur zwei Dinge:
 *  1. „Teilen → PDF Libre“ (Android, installierte App): Die geteilte Datei kommt als POST an /share-target.
 *     Wir legen sie im Browser ab (IndexedDB, gleich wie site.js) und öffnen die Startseite,
 *     die passende Werkzeuge vorschlägt. Die Datei geht dabei an keinen Server.
 *  2. Ohne Internet: statt einer Browser-Fehlerseite eine kleine Hinweisseite.
 */
const CACHE = "pl-offline-v1";
const OFFLINE = "/offline.html";

self.addEventListener("install", (e) => {
  // Fehlt die Offline-Seite, trotzdem installieren (sonst bliebe gar kein Service Worker aktiv)
  e.waitUntil(caches.open(CACHE).then((c) => c.add(OFFLINE)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method === "POST" && url.pathname === "/share-target") {
    e.respondWith(receiveShare(e.request));
    return;
  }
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match(OFFLINE)));
  }
});

async function receiveShare(request) {
  try {
    const form = await request.formData();
    const file = form.getAll("file").find((f) => f && f.size);
    if (file) await put({ blob: file, name: file.name || "datei", type: file.type, ts: Date.now() });
  } catch (_) {
    /* ohne Datei einfach die Startseite öffnen */
  }
  return Response.redirect("/?shared=1", 303);
}

function put(value) {
  return new Promise((ok, fail) => {
    const r = indexedDB.open("pdflibre", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("handoff");
    r.onerror = () => fail(r.error);
    r.onsuccess = () => {
      const tx = r.result.transaction("handoff", "readwrite");
      tx.objectStore("handoff").put(value, "file");
      tx.oncomplete = ok;
      tx.onerror = () => fail(tx.error);
    };
  });
}
