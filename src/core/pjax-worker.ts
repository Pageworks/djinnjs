/** The Pjax Web Worker class. Used to handle page revision checking & navigation requests. */
class PjaxWorker {
    private prefetchQueue: Array<string>;

    constructor() {
        self.onmessage = this.handleMessage.bind(this);
        this.prefetchQueue = [];
    }

    /**
     * Handles the incoming messages sent from the Pjax class.
     * @param e - the `MessageEvent`
     */
    private handleMessage(e: MessageEvent): void {
        const { type } = e.data;
        switch (type) {
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
                console.error(`Unknown Pjax Worker message type: ${type}`);
                break;
        }
    }

    /**
     * Fetches the URL provided by the Pjax class.
     * The service worker will cache the response.
     */
    private prefetch() {
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

        fetch(url, {
            method: "GET",
            credentials: "include",
            headers: new Headers({
                "X-Requested-With": "XMLHttpRequest",
                "X-Pjax": "true",
            }),
        })
            .then(() => {})
            .catch(() => {})
            .finally(() => {
                this.prefetch();
            });
    }

    /**
     * Fetch the requested URL and respond with the fetch request body or the fetch errors.
     * @param url - the requested URL
     * @param requestId - the request ID
     */
    private async pjax(url: string, requestId: string, currentUrl: string, followRedirects: boolean) {
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
    private checkRevision(url: string) {
        let newEtag = null;
        let cachedETag = null;

        /** Get the headers from the redis server */
        new Promise((resolve, reject) => {
            fetch(url, {
                method: "HEAD",
                credentials: "include",
                cache: "no-cache",
            })
                .then(request => {
                    if (request.ok) {
                        resolve(request.headers.get("ETag"));
                    }

                    resolve(null);
                })
                .catch(() => {
                    reject();
                });
        })
            .then(tag => {
                newEtag = tag;
                if (cachedETag) {
                    this.checkETags(newEtag, cachedETag, url);
                }
            })
            .catch(() => {});

        /** Get the cached response from the service worker */
        new Promise((resolve, reject) => {
            fetch(url, {
                method: "GET",
                credentials: "include",
            })
                .then(request => {
                    if (request.ok) {
                        resolve(request.headers.get("ETag"));
                    }

                    resolve(null);
                })
                .catch(() => {
                    reject();
                });
        })
            .then(tag => {
                cachedETag = tag;
                if (newEtag) {
                    this.checkETags(newEtag, cachedETag, url);
                }
            })
            .catch(() => {});
    }

    /**
     * Compares the `ETag` header from the server with the cached version.
     * @param newTag - `ETag` header from the Redis server.
     * @param cachedTag - `ETag` header from the service workers cached response.
     */
    private checkETags(newTag: string, cachedTag: string, url: string) {
        if (!newTag || !cachedTag) {
            return;
        }
        if (newTag !== cachedTag) {
            // @ts-ignore
            self.postMessage({
                type: "revision-check",
                status: "stale",
                url: url,
            });
        }
    }
}
new PjaxWorker();
