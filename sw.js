const CACHE="mofid-verify-v1";
const ASSETS=["./","./index.html","./styles.css","./app.js","./manifest.webmanifest","./assets/icon.svg"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  const req=event.request, url=new URL(req.url);
  if(req.method!=="GET" || url.origin!==self.location.origin) return;
  // Never cache user-selected video blobs or any uploaded media.
  if(req.destination==="video" || url.pathname.match(/\.(mp4|mov|webm)$/i)) return;
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    if(res.ok && res.type==="basic"){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}
    return res;
  })));
});