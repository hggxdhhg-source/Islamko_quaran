const CACHE = "islamko-v8";
const SHELL = ["index.html", "Islamko1_Premium (2).css", "Islamko.css", "Islamko.js", "IslamkoHadiths.js", "QuranAudio.js", "IslamkoNotifications.js", "manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
});

// ملفات الموقع: الشبكة أولًا ثم النسخة المحفوظة (يعمل بدون إنترنت)
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => { caches.open(CACHE).then((c) => c.put(e.request, r.clone())); return r; })
      .catch(() => caches.match(e.request))
  );
});

// التعامل مع النقر على الإشعارات وفتح التطبيق بالقسم المطلوب
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const targetHash = e.notification.data?.url || "./";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          if ("navigate" in client && targetHash) {
            client.navigate(targetHash);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetHash);
      }
    })
  );
});
