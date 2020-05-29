// @ts-nocheck

let resourcesCacheId = "resources-initial";
let contentCacheId = "content-initial";
let prefetchQueue = [];

self.addEventListener("message", event => {
    const { type } = event.data;
    switch (type) {
        case "cachebust":
            cachebust(event.data.url);
            break;
        case "page-refresh":
            updatePageCache(event.data.url, event.data.network);
            break;
        case "clear-content-cache":
            clearContentCache();
            break;
        case "revision-check":
            this.checkRevision(e.data.url);
            break;
        case "pjax":
            this.pjax(e.data.url, e.data.requestId, e.data.currentUrl, e.data.followRedirects);
            break;
        case "prefetch":
            const existingQueue = this.prefetch.length;
            this.prefetchQueue = [...this.prefetchQueue, ...e.data.urls];
            if (!existingQueue) {
                this.prefetch();
            }
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
        const isResource = event.request.url.match(/(\.js)$|(\.css)$|(\.mjs)$|(\.cjs)$|(\.png)$|(\.jpg)$|(\.gif)$|(\.webp)$|(\.jpeg)$/gi);
        const cacheName = isResource ? resourcesCacheId : contentCacheId;

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

function informClientOfCachebustValues(maximumContentPrompts, contentCacheDuration, url) {
    clients = self.clients.matchAll().then(clients => {
        clients.map(client => {
            if (client.visibilityState === "visible" && client.url === url) {
                client.postMessage({
                    type: "cachebust",
                    max: parseInt(maximumContentPrompts),
                    contentCacheExpires: parseInt(contentCacheDuration),
                });
            }
        });
    });
}

async function bustResources(url) {
    const resourceRequest = fetch(`/resources-cachebust.json`, {
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

async function bustContent(url) {
    const contentRequest = await fetch("REPLACE_WITH_CACHEBUST_URL", {
        cache: "no-cache",
        credentials: "include",
        headers: new Headers({
            Accept: "application/json",
        }),
    });
    if (contentRequest.ok) {
        const response = await contentRequest.json();
        contentCacheId = `content-${response.cacheTimestamp}`;
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (new RegExp(/content/i).test(cacheName) && cacheName !== contentCacheId) {
                        return caches.delete(cacheName);
                    }
                })
            );
        });
        informClientOfCachebustValues(response.maximumContentPrompts, response.contentCacheDuration, url);
    } else {
        if (contentCacheId === "content-initial") {
            contentCacheId = `content-${Date.now()}`;
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (new RegExp(/content/i).test(cacheName) && cacheName !== contentCacheId) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            });
        }
        informClientOfCachebustValues(4, 7, url);
    }
}

async function cachebust(url) {
    this.bustResources(url);
    this.bustContent(url);
}

async function updatePageCache(url, network) {
    try {
        const request = new Request(url);
        await new Promise(resolve => {
            caches.open(contentCacheId).then(cache => {
                cache.delete(request).then(() => {
                    resolve();
                });
            });
        });
        if (network === "4g") {
            await new Promise(resolve => {
                fetch(url, {
                    credentials: "include",
                }).then(response => {
                    if (!response || response.status !== 200 || response.type !== "basic") {
                        resolve();
                    }
                    caches.open(contentCacheId).then(cache => {
                        cache.put(request, response);
                        resolve();
                    });
                });
            });
        }
        const clients = await self.clients.matchAll();
        clients.map(client => {
            if (client.visibilityState === "visible" && client.url === url) {
                client.postMessage({
                    type: "page-refresh",
                });
            }
        });
    } catch (error) {
        console.error(error);
    }
}

/**
 * Fetches the URL provided by the Pjax class.
 * The service worker will cache the response.
 */
async function prefetch() {
    if (this.prefetchQueue.length === 0) {
        return;
    }

    const url = this.prefetchQueue[0];
    this.prefetchQueue.splice(0, 1);

    /** Prevents prefetching external webpages */
    if (new RegExp(/(http\:\/\/)|(https\:\/\/)/gi).test(url) && new RegExp(self.location.origin).test(url) === false) {
        this.prefetch();
        return;
    }

    await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: new Headers({
            "X-Requested-With": "XMLHttpRequest",
            "X-Pjax": "true",
        }),
    });
    this.prefetch();
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

/**
 * Fetches the pages headers from the Redis server and the cached response from the service worker.
 * @param url - the page URL that will be checked
 */
async function checkRevision(url) {
    try {
        let headRequest = fetch(url, {
            method: "HEAD",
            credentials: "include",
            cache: "no-cache",
        });

        let getRequest = fetch(url, {
            method: "GET",
            credentials: "include",
        });

        const newEtag = (await headRequest)?.headers?.get("ETag") || null;
        const cachedETag = (await getRequest)?.headers?.get("ETag") || null;

        if (!newEtag || !cachedETag) {
            return;
        }

        if (newEtag !== cachedETag) {
            // @ts-ignore
            self.postMessage({
                type: "revision-check",
                status: "stale",
                url: url,
            });
        }

        return;
    } catch (error) {
        throw error;
    }
}
