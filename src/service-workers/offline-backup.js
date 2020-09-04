// @ts-nocheck

let resourcesCacheId = "resources-initial";
let contentCacheId = "content-initial";

self.addEventListener("message", event => {
    const { type } = event.data;
    switch (type) {
        case "cachebust":
            cachebust();
            break;
        case "clear-content-cache":
            clearContentCache();
            break;
        default:
            console.error(`Unknown Service Worker message type: ${type}`);
            break;
    }
});

self.addEventListener("fetch", event => {
    const noCache = event.request.url.match(new RegExp(REPLACE_WITH_NO_CACHE_PATTERN));
    if (noCache || event.request.method !== "GET") {
        // Use a passthrough to ignore the caching system
        event.respondWith(fetch(event.request));
    } else {
        const isResource = event.request.url.match(new RegExp(REPLACE_WITH_RESOURCE_PATTERN));
        const cacheName = isResource ? resourcesCacheId : contentCacheId;
        const offlineBackup = caches.match(event.request).then(response => {
            return response;
        });
        event.respondWith(
            fetch(event.request, {
                redirect: "follow",
                credentials: "include",
            })
                .then(response => {
                    if (!response || response.status !== 200 || response.type !== "basic" || response.headers.get("PWA-Cache") === "no-cache" || response.redirected) {
                        return response;
                    }
                    var responseToCache = response.clone();
                    caches.open(cacheName).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    return offlineBackup;
                })
        );
    }
});

function clearContentCache() {
    caches.keys().then(cacheNames => {
        return Promise.all(
            cacheNames.map(cacheName => {
                if (cacheName.match("content")) {
                    return caches.delete(cacheName);
                }
            })
        );
    });
}

async function bustResources() {
    const resourceRequest = await fetch(`/resources-cachebust.json`, {
        cache: "no-cache",
        credentials: "include",
        headers: new Headers({
            Accept: "application/json",
        }),
    });
    if (resourceRequest.ok) {
        const response = await resourceRequest.json();
        resourcesCacheId = `resources-${response.cacheTimestamp}`;
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (new RegExp(/resources/i).test(cacheName) && cacheName !== resourcesCacheId) {
                        return caches.delete(cacheName);
                    }
                })
            );
        });
    }
}

async function bustContent() {
    const contentRequest = await fetch("REPLACE_WITH_CACHEBUST_URL", {
        cache: "no-cache",
        credentials: "include",
        headers: new Headers({
            Accept: "application/json",
        }),
    });
    if (contentRequest.ok) {
        const response = await contentRequest.json();
        if (response.success) {
            contentCacheId = `content-${response.cacheTimestamp}`;
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName.match("content") && cacheName !== contentCacheId) {
                            caches.delete(cacheName);
                        }
                    })
                );
            });
        }
    }
}

async function cachebust() {
    await bustResources();
    await bustContent();
    await warmTheCache();
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
            if (response?.content) {
                event.waitUntil(
                    caches.open(contentCacheId).then(cache => {
                        return cache.addAll(response.content);
                    })
                );
            }
        }
    }
}
