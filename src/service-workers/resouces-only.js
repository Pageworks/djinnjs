// @ts-nocheck

let resourcesCacheId = "resources-initial";

self.addEventListener("message", event => {
    const { type } = event.data;
    switch (type) {
        case "cachebust":
            cachebust();
            break;
        case "pjax":
            this.pjax(e.data.url, e.data.requestId, e.data.currentUrl, e.data.followRedirects);
            break;
        default:
            console.error(`Unknown Service Worker message type: ${type}`);
            break;
    }
});

self.addEventListener("fetch", event => {
    const isResource = event.request.url.match(/(\.js)$|(\.css)$|(\.mjs)$|(\.cjs)$|(\.png)$|(\.jpg)$|(\.gif)$|(\.webp)$|(\.jpeg)$/gi);
    if (isResource) {
        const cacheName = resourcesCacheId;
        event.respondWith(
            caches.match(event.request).then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request, {
                    redirect: "follow",
                    credentials: "include",
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

/**
 * Fetch the requested URL and respond with the fetch request body or the fetch errors.
 * @param url - the requested URL
 * @param requestId - the request ID
 */
async function pjax(url, requestId, currentUrl, followRedirects) {
    // Handle external links
    if (new RegExp(self.location.origin).test(url) === false) {
        // @ts-ignore
        self.postMessage({
            type: "pjax",
            status: "external",
            url: url,
            requestId: requestId,
        });
        return;
    }

    // Handle page jumps
    if (new RegExp(/\#/g).test(url)) {
        const cleanUrl = url.replace(/\#.*/g, "");
        const cleanCurrentUrl = currentUrl.replace(/\#.*/g, "");
        if (cleanUrl === cleanCurrentUrl) {
            // @ts-ignore
            self.postMessage({
                type: "pjax",
                status: "hash-change",
                url: url,
                requestId: requestId,
            });
            return;
        }
    }

    try {
        const request = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: new Headers({
                "X-Requested-With": "XMLHttpRequest",
                "X-Pjax": "true",
            }),
        });
        if (request.ok && request.headers?.get("Content-Type")?.match(/(text\/html)/gi)) {
            if (request.redirected && !followRedirects) {
                // @ts-ignore
                self.postMessage({
                    type: "pjax",
                    status: "error",
                    error: "Request resulted in a redirect and following redirects is disabled",
                    url: url,
                    requestId: requestId,
                });
                return;
            }
            const response = await request.text();
            // @ts-ignore
            self.postMessage({
                type: "pjax",
                status: "ok",
                body: response,
                requestId: requestId,
                url: url,
            });
        } else {
            // @ts-ignore
            self.postMessage({
                type: "pjax",
                status: "error",
                error: request.statusText,
                url: url,
                requestId: requestId,
            });
        }
    } catch (error) {
        // @ts-ignore
        self.postMessage({
            type: "pjax",
            status: "error",
            error: error,
            url: url,
            requestId: requestId,
        });
    }
}
