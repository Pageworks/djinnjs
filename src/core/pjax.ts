import { env, uid } from "./env";
import { sendPageView, setupGoogleAnalytics } from "./gtags.js";
import { gaId, followRedirects, doPrefetching, pageJumpOffset, djinnjsOutDir, useServiceWorker } from "./config";

interface PjaxState {
    activeRequestUid: string;
}

interface NavigaitonRequest {
    body?: string;
    title?: string;
    url: string;
    history?: "push" | "replace";
    requestUid?: string;
    targetSelector?: string;
    tickets?: string[];
    customPageJumpOffset?: number;
}

class Pjax {
    private state: PjaxState;
    private worker: Worker;
    private navigationRequestQueue: Array<NavigaitonRequest>;
    private io: IntersectionObserver;
    private serviceWorker: ServiceWorker;

    constructor() {
        this.state = {
            activeRequestUid: null,
        };
        this.worker = null;
        this.navigationRequestQueue = [];
        this.serviceWorker = null;
        this.io = new IntersectionObserver(this.handleIntersection);
        this.init();
    }

    /**
     * Initializes the Pjax class.
     */
    private init(): void {
        /** Prepare our reload prompt tracking for the session */
        if (!sessionStorage.getItem("prompts")) {
            sessionStorage.setItem("prompts", "0");
        }

        if (!localStorage.getItem("contentCache")) {
            localStorage.setItem("contentCache", `${Date.now()}`);
        }

        document.addEventListener("pjax:revision", this.checkPageRevision);
        document.addEventListener("pjax:load", (e: CustomEvent) => {
            this.navigate({
                url: e.detail.url,
                history: e.detail?.history ?? "push",
                targetSelector: e.detail?.selector,
                tickets: e.detail?.tickets ?? [],
                customPageJumpOffset: e.detail?.customPageJumpOffset,
            });
        });
        document.addEventListener("pjax:continue", (e: CustomEvent) => {
            this.swapPjaxContent(e.detail.requestUid);
        });
        document.addEventListener("pjax:init", () => {
            this.worker = new Worker(`${location.origin}/${djinnjsOutDir}/pjax-worker.mjs`);
            this.worker.onmessage = this.handleWorkerMessage.bind(this);
            if (useServiceWorker && typeof navigator.serviceWorker !== "undefined") {
                this.serviceWorker = navigator.serviceWorker.controller;
                navigator.serviceWorker.onmessage = this.serviceWorkerInbox.bind(this);
            }
            this.checkPageRevision();
            this.collectLinks();
        });

        /** Prepare Google Analytics */
        setupGoogleAnalytics(gaId);

        /** Add event listeners */
        window.addEventListener("popstate", this.windowPopstateEvent);
        /** Update the history state with the required `state.url` value */
        window.history.replaceState({ url: window.location.href }, document.title, window.location.href);
    }

    private serviceWorkerInbox(e: MessageEvent) {
        const { type } = e.data;
        switch (type) {
            case "page-refresh":
                let promptCount = parseInt(sessionStorage.getItem("prompts"));
                promptCount = promptCount + 1;
                sessionStorage.setItem("prompts", `${promptCount}`);
                const event = new CustomEvent("pjax:stale");
                document.dispatchEvent(event);
                break;
            case "cachebust":
                sessionStorage.setItem("maxPrompts", `${e.data.max}`);
                const currentPromptCount = sessionStorage.getItem("prompts");
                if (parseInt(currentPromptCount) >= e.data.max) {
                    sessionStorage.setItem("prompts", "0");
                    if (this.serviceWorker) {
                        this.serviceWorker.postMessage({
                            type: "clear-content-cache",
                        });
                    }
                }
                const contentCacheTimestap = parseInt(localStorage.getItem("contentCache"));
                const difference = Date.now() - contentCacheTimestap;
                const neededDifference = e.data.contentCacheExpires * 24 * 60 * 60 * 1000;
                if (difference >= neededDifference) {
                    localStorage.setItem("contentCache", `${Date.now()}`);
                    if (this.serviceWorker) {
                        this.serviceWorker.postMessage({
                            type: "clear-content-cache",
                        });
                    }
                }
                break;
            default:
                break;
        }
    }

    private finalize(url: string, title: string, history: "push" | "replace", customPageJumpOffset: number) {
        this.updateHistory(title, url, history);
        if (new RegExp("#").test(url)) {
            this.scrollToHash(url, customPageJumpOffset);
        }
        this.collectLinks();
        this.checkPageRevision();
        sendPageView(window.location.pathname, gaId);
        const event = new CustomEvent("pjax:complete");
        document.dispatchEvent(event);
    }

    /**
     * Handles messages from the Service Worker.
     * @param e - the `MessageEvent` object
     */
    private handleWorkerMessage(e: MessageEvent): void {
        const { type } = e.data;
        switch (type) {
            case "revision-check":
                if (e.data.status === "stale" && this.serviceWorker) {
                    this.serviceWorker.postMessage({
                        type: "page-refresh",
                        url: e.data.url,
                        network: env.connection,
                    });
                }
                break;
            case "pjax":
                this.handlePjaxResponse(e.data.requestId, e.data.status, e.data.url, e.data?.body, e.data?.error);
                break;
            default:
                console.error(`Undefined Service Worker response message type: ${type}`);
                break;
        }
    }

    private scrollToHash(url: string, customPageJumpOffset: number): void {
        const hash = url.match(/\#.*/)[0];
        const element = document.body.querySelector(hash);

        if (!element) {
            return;
        }

        if (pageJumpOffset === null && customPageJumpOffset === null) {
            element.scrollIntoView({
                behavior: "auto",
                block: "center",
            });
            return;
        }

        element.scrollIntoView({
            behavior: "auto",
            block: "start",
        });
        if (customPageJumpOffset !== null) {
            window.scrollBy({
                behavior: "auto",
                top: customPageJumpOffset,
                left: 0,
            });
        } else {
            window.scrollBy({
                behavior: "auto",
                // @ts-ignore
                top: pageJumpOffset,
                left: 0,
            });
        }
    }

    /**
     * Creates and sends a navigation request to the Pjax web worker and queues navigation request.
     */
    private navigate(request: NavigaitonRequest): void {
        const defaultRequest: NavigaitonRequest = {
            url: null,
            history: "push",
            requestUid: uid(),
            targetSelector: null,
            tickets: [],
            customPageJumpOffset: null,
        };
        env.startPageTransition();
        const navigationRequest: NavigaitonRequest = Object.assign(defaultRequest, request);
        this.state.activeRequestUid = navigationRequest.requestUid;
        this.navigationRequestQueue.push(navigationRequest);
        this.worker.postMessage({
            type: "pjax",
            requestId: navigationRequest.requestUid,
            url: navigationRequest.url,
            currentUrl: location.href,
            followRedirects: followRedirects,
        });
    }

    private windowPopstateEvent: EventListener = (e: PopStateEvent) => {
        /** Only hijack the event when the `history.state` object contains a URL */
        if (e.state?.url) {
            this.navigate({
                url: e.state.url,
                history: "replace",
            });
        }
    };

    /**
     * Handles history manipulation by replacing or pushing the new state into the windows history timeline.
     * @param title - the new document title
     * @param url - the new pages URL
     * @param history - how the window history should be manipulated
     */
    private updateHistory(title: string, url: string, history: "push" | "replace"): void {
        if (history === "replace") {
            window.history.replaceState(
                {
                    url: url,
                },
                title,
                url
            );
        } else {
            window.history.pushState(
                {
                    url: url,
                },
                title,
                url
            );
        }
    }

    /**
     * Called when the `click` event fires on a Pjax tracked anchor element.
     */
    private handleLinkClick: EventListener = (e: Event) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLAnchorElement;
        const navigationUid = uid();
        target.setAttribute("navigation-request-id", navigationUid);
        const customPageJumpOffset = target.getAttribute("page-jump-offset");
        const offset = customPageJumpOffset ? parseInt(customPageJumpOffset) : null;
        this.navigate({
            url: target.href,
            requestUid: navigationUid,
            targetSelector: target.getAttribute("pjax-view-id"),
            customPageJumpOffset: offset,
        });
    };

    /**
     * Called when the `mouseenter` event fires on a Pjax tracked anchor element.
     */
    private handleLinkPrefetch: EventListener = (e: Event) => {
        const target = e.currentTarget as HTMLAnchorElement;
        this.worker.postMessage({
            type: "prefetch",
            url: target.href,
        });
    };

    /**
     * Collect all anchor elements with a `href` attribute and add a click event listener.
     * Ignored links are:
     * - any link with a `no-pjax` attribute
     * - any link with a `no-pjax` class
     * - any link with a `target` attribute
     * - any link with a `download` attribute
     */
    private collectLinks(): void {
        const unregisteredLinks = Array.from(document.body.querySelectorAll("a[href]:not([pjax-tracked]):not([no-pjax]):not([target]):not(.no-pjax):not([download])"));
        if (unregisteredLinks.length) {
            unregisteredLinks.map((link: HTMLAnchorElement) => {
                link.setAttribute("pjax-tracked", "true");
                link.addEventListener("click", this.handleLinkClick);

                /** Require at least a 3g connection & respect the users data saver setting */
                if (doPrefetching && env.connection !== "2g" && env.connection !== "slow-2g" && !env.dataSaver) {
                    link.addEventListener("mouseenter", this.handleLinkPrefetch);
                }
            });
        }
    }

    /**
     * Handles the Pjax response from the web worker.
     * This method will update the `NavigationRequest` object and continue with the transition or will remove the stale request or will fallback to traditional (native) page navigaiton when an error occurs.
     * @param requestId - the navigation request's unique ID
     * @param status - the response status of the request
     * @param url - the requested URL
     * @param body - the body text of the requested page
     * @param error - the error message of the failed request
     */
    private handlePjaxResponse(requestId: string, status: string, url: string, body?: string, error?: string) {
        const request: NavigaitonRequest = this.getNavigaitonRequest(requestId);
        if (requestId === this.state.activeRequestUid) {
            if (status === "external") {
                window.location.href = url;
            } else if (status === "hash-change") {
                location.hash = url.match(/\#.*/g)[0].replace("#", "");
            } else if (status === "ok") {
                const event = new CustomEvent("djinn:parse", {
                    detail: {
                        body: body,
                        requestUid: requestId,
                    },
                });
                document.dispatchEvent(event);
                request.body = body;
            } else {
                console.error(`Failed to fetch page: ${url}. Server responded with: ${error}`);
                window.location.href = url;
            }
        } else {
            this.removeNavigationRequest(request.requestUid);
            if (status !== "ok") {
                console.error(`Failed to fetch page: ${url}. Server responded with: ${error}`);
            }
        }
    }

    /**
     * Swaps the main elements inner HTML.
     * @param requestUid - the navigation request unique id
     */
    private swapPjaxContent(requestUid: string) {
        const request: NavigaitonRequest = this.getNavigaitonRequest(requestUid);
        if (request.requestUid === this.state.activeRequestUid) {
            let selectors: Array<string> = [];
            let currentViews: Array<HTMLElement> = [];
            if (request.targetSelector !== null) {
                selectors = [`[pjax-id="${request.targetSelector}"]`];
                const currentView = document.documentElement.querySelector(selectors[0]);
                if (!currentView) {
                    console.error(`${location.href} is missing selector ${selectors[0]}`);
                    window.location.href = request.url;
                    return;
                }
            } else {
                currentViews = Array.from(document.documentElement.querySelectorAll("[pjax-id]"));
                if (currentViews.length) {
                    for (let i = 0; i < currentViews.length; i++) {
                        // Don't hotswap views within views
                        if (currentViews[i]?.parentElement?.closest("[pjax-id]") === null) {
                            selectors.push(`[pjax-id="${currentViews[i].getAttribute("pjax-id")}"]`);
                        }
                    }
                } else {
                    const main = document.documentElement.querySelector("main");
                    if (main) {
                        selectors = ["main"];
                        currentViews.push(main);
                    } else {
                        selectors = ["body"];
                        currentViews.push(document.body);
                    }
                }
            }

            for (let i = 0; i < currentViews.length; i++) {
                currentViews[i].innerHTML = "";
            }

            const tempDocument: HTMLDocument = document.implementation.createHTMLDocument("pjax-temp-document");
            tempDocument.documentElement.innerHTML = request.body;

            const newViews: Array<HTMLElement> = [];
            for (let i = 0; i < selectors.length; i++) {
                const newView = tempDocument.documentElement.querySelector(selectors[i]) as HTMLElement;
                if (newView) {
                    newViews.push(newView);
                } else {
                    console.error(`${request.url} is missing selector ${selectors[i]}`);
                    window.location.href = request.url;
                    return;
                }
            }

            if (newViews.length !== currentViews.length) {
                console.error(`Something went wrong when collecting the views`);
                window.location.href = request.url;
                return;
            }

            for (let i = 0; i < currentViews.length; i++) {
                for (let k = 0; k < newViews.length; k++) {
                    // This will work for body and main elements because the attribute will return null for both
                    // Since there is only 1 view in the queue when swapping the main or body we are OK to assume they're the same view
                    if (currentViews[i].getAttribute("pjax-id") === newViews[k].getAttribute("pjax-id")) {
                        currentViews[i].innerHTML = newViews[k].innerHTML;
                        break;
                    }
                }
            }

            document.title = tempDocument.title;

            window.scroll({
                top: 0,
                left: 0,
                behavior: "auto",
            });

            for (let i = 0; i < request.tickets.length; i++) {
                env.stopLoading(request.tickets[i]);
            }

            this.finalize(request.url, tempDocument.title, request.history, request.customPageJumpOffset);
            const mountEvent = new CustomEvent("djinn:mount-components");
            document.dispatchEvent(mountEvent);
            const scriptEvent = new CustomEvent("djinn:mount-scripts", {
                detail: {
                    selectors: selectors,
                },
            });
            document.dispatchEvent(scriptEvent);

            env.endPageTransition();
        }
        this.removeNavigationRequest(request.requestUid);
    }

    /**
     * Removes the `NavigationRequest` object from the queue.
     * @param requestId - the unique ID of the `NavigationRequest` object
     */
    private removeNavigationRequest(requestId: string): void {
        for (let i = 0; i < this.navigationRequestQueue.length; i++) {
            if (this.navigationRequestQueue[i].requestUid === requestId) {
                this.navigationRequestQueue.splice(i, 1);
                break;
            }
        }
    }

    /**
     * Gets the `NavigationRequest` object from the queue.
     * @param requestId - the unique ID of the `NavigationRequest` object
     */
    private getNavigaitonRequest(requestId: string): NavigaitonRequest {
        for (let i = 0; i < this.navigationRequestQueue.length; i++) {
            if (this.navigationRequestQueue[i].requestUid === requestId) {
                return this.navigationRequestQueue[i];
            }
        }

        return null;
    }

    /**
     * Sends a `revision-check` message to the Pjax web worker.
     */
    private checkPageRevision(): void {
        this.worker.postMessage({
            type: "revision-check",
            url: window.location.href,
        });
    }

    /**
     * Grabs the URLs from all of the observed anchor elements, unobserves the element, and sends the URLs to the Pjax web worker.
     * @param links - array of `IntersectionObserverEntry` objects
     */
    private prefetchLink(links: Array<IntersectionObserverEntry>): void {
        const urls: Array<string> = [];
        links.map(entry => {
            if (entry.isIntersecting) {
                const link = entry.target as HTMLAnchorElement;
                this.io.unobserve(link);
                urls.push(link.href);
            }
        });
        if (urls.length) {
            /** Send the requested URLs to the Pjax web worker */
            this.worker.postMessage({
                type: "prefetch",
                urls: urls,
            });
        }
    }
    private handleIntersection: IntersectionObserverCallback = this.prefetchLink.bind(this);
}
new Pjax();
