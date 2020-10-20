// @ts-nocheck

let resourcesCacheId = "resources-initial";

self.addEventListener("message", event => {
    const { type } = event.data;
    switch (type) {
        case "cachebust":
            cachebust();
            break;
        default:
            console.error(`Unknown Service Worker message type: ${type}`);
            break;
    }
});

self.addEventListener("fetch", event => {
    const isResource = event.request.url.match(new RegExp(REPLACE_WITH_RESOURCE_PATTERN));
    if (isResource) {
        const cacheName = resourcesCacheId;
        event.respondWith(
            caches.match(event.request).then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request, {
                    redirect: "follow",
                }).then(response => {
                    if (!response || response.status !== 200 || response.type !== "basic" || response.headers.get("PWA-Cache") === "no-cache" || response.redirected) {
                        return response;
                    }

                    var responseToCache = response.clone();
                    caches.open(cacheName).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                });
            })
        );
    } else {
        // Use a passthrough to ignore the caching system
        event.respondWith(fetch(event.request));
    }
});

async function cachebust() {
    const request = await fetch(`/resources-cachebust.json`, {
        cache: "no-cache",
        credentials: "include",
        headers: new Headers({
            Accept: "application/json",
        }),
    });
    if (request.ok) {
        const response = await request.json();
        resourcesCacheId = `resources-${response.cacheTimestamp}`;
        caches
            .keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== resourcesCacheId) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                warmTheCache();
            });
    }
}

async function warmTheCache() {
    const precacheURL = "REPLACE_WITH_PRECACHE_URL";
    if (precacheURL.length) {
        const request = await fetch(precacheURL, {
            cache: "no-cache",
            credentials: "include",
            headers: new Headers({
                Accept: "application/json",
            }),
        });
        const response = await request.json();
        if (request.ok) {
            if (response?.resources) {
                event.waitUntil(
                    caches.open(resourcesCacheId).then(cache => {
                        return cache.addAll(response.resources);
                    })
                );
            }
        }
    }
}
