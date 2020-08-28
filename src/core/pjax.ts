import { hookup, message } from "../web_modules/broadcaster";
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
    history: "push" | "replace";
    requestUid: string;
    target: HTMLElement | null;
    targetSelector: string;
    tickets: string[];
    customPageJumpOffset: number;
}

class Pjax {
    private state: PjaxState;
    private worker: Worker;
    private navigationRequestQueue: Array<NavigaitonRequest>;
    private io: IntersectionObserver;
    private serviceWorker: ServiceWorker;
    private inboxUid: string;

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

        /** Hookup Pjax's inbox */
        this.inboxUid = hookup("pjax", this.inbox.bind(this));

        /** Prepare Google Analytics */
        setupGoogleAnalytics(gaId);

        /** Add event listeners */
        window.addEventListener("popstate", this.windowPopstateEvent);
        /** Update the history state with the required `state.url` value */
        window.history.replaceState({ url: window.location.href }, document.title, window.location.href);
    }

    /**
     * The public inbox for the Pjax class. All incoming messages sent through the `Broadcaster` will be received here.
     * @param data - the `MessageData` passed into the inbox by the `Broadcaster` class
     */
    private inbox(data): void {
        const { type } = data;
        switch (type) {
            case "revision-check":
                this.checkPageRevision();
                break;
            case "hijack-links":
                this.collectLinks();
                break;
            case "load":
                this.navigate(data.url, data?.history, data?.selector, data?.navRequestId, data?.tickets, data?.customPageJumpOffset);
                break;
            case "finalize-pjax":
                this.updateHistory(data.title, data.url, data.history);
                if (new RegExp("#").test(data.url)) {
                    this.scrollToHash(data.url, data.customPageJumpOffset);
                }
                this.collectLinks();
                this.checkPageRevision();
                sendPageView(window.location.pathname, gaId);
                if (doPrefetching) {
                    this.prefetchLinks();
                }
                message({
                    recipient: "pjax",
                    type: "completed",
                });
                break;
            case "css-ready":
                this.swapPjaxContent(data.requestUid);
                break;
            case "prefetch":
                if (doPrefetching) {
                    this.prefetchLinks();
                }
                break;
            case "init":
                this.worker = new Worker(`${location.origin}/${djinnjsOutDir}/pjax-worker.mjs`);
                this.worker.onmessage = this.handleWorkerMessage.bind(this);
                if (useServiceWorker && typeof navigator.serviceWorker !== "undefined") {
                    this.serviceWorker = navigator.serviceWorker.controller;
                    navigator.serviceWorker.onmessage = this.serviceWorkerInbox.bind(this);
                }
                this.checkPageRevision();
                /** Tell Pjax to hijack all viable links */
                message({
                    recipient: "pjax",
                    type: "hijack-links",
                });
                /** Tell Pjax to prefetch links */
                message({
                    recipient: "pjax",
                    type: "prefetch",
                });
                break;
            default:
                return;
        }
    }

    private serviceWorkerInbox(e: MessageEvent) {
        const { type } = e.data;
        switch (type) {
            case "page-refresh":
                let promptCount = parseInt(sessionStorage.getItem("prompts"));
                promptCount = promptCount + 1;
                sessionStorage.setItem("prompts", `${promptCount}`);
                message({
                    recipient: "user-input",
                    type: "stale-notification",
                });
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
    private navigate(
        url: string,
        history: "push" | "replace" = "push",
        selector: string = null,
        navRequestId: string = null,
        tickets: Array<string> = [],
        customPageJumpOffset: number = null
    ): void {
        env.startPageTransition();
        const requestUid = navRequestId || uid();
        this.state.activeRequestUid = requestUid;
        const navigationRequest: NavigaitonRequest = {
            url: url,
            history: history,
            requestUid: requestUid,
            target: document.body.querySelector(`[navigation-request-id="${requestUid}"]`) || null,
            targetSelector: selector,
            tickets: tickets,
            customPageJumpOffset: customPageJumpOffset,
        };
        this.navigationRequestQueue.push(navigationRequest);
        this.worker.postMessage({
            type: "pjax",
            requestId: requestUid,
            url: url,
            currentUrl: location.href,
            followRedirects: followRedirects,
        });
    }

    /**
     * Handles the windows `popstate` event.
     * @param e - the `PopStateEvent` object
     */
    private hijackPopstate(e: PopStateEvent): void {
        /** Only hijack the event when the `history.state` object contains a URL */
        if (e.state?.url) {
            /** Tells the Pjax class to load the URL stored in this windows history.
             * In order to preserve the timeline navigation the history will use `replace` instead of `push`.
             */
            message({
                recipient: "pjax",
                type: "load",
                data: {
                    url: e.state.url,
                    history: "replace",
                },
            });
        }
    }
    private windowPopstateEvent: EventListener = this.hijackPopstate.bind(this);

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
        /** Tell Pjax to load the clicked elements page */
        message({
            recipient: "pjax",
            type: "load",
            data: {
                url: target.href,
                selector: target.getAttribute("pjax-view-id"),
                navRequestId: navigationUid,
                customPageJumpOffset: customPageJumpOffset ? parseInt(customPageJumpOffset) : null,
            },
        });
    };

    /**
     * Collect all anchor elements with a `href` attribute and add a click event listener.
     * Ignored links are:
     * - any link with a `no-pjax` attribute
     * - any link with a `no-pjax` class
     * - any link with a `target` attribute
     */
    private collectLinks(): void {
        const unregisteredLinks = Array.from(document.body.querySelectorAll("a[href]:not([pjax-tracked]):not([no-pjax]):not([target]):not(.no-pjax)"));
        if (unregisteredLinks.length) {
            unregisteredLinks.map((link: HTMLAnchorElement) => {
                link.setAttribute("pjax-tracked", "true");
                link.addEventListener("click", this.handleLinkClick);
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
        const request = this.getNavigaitonRequest(requestId);
        if (requestId === this.state.activeRequestUid) {
            if (status === "external") {
                window.location.href = url;
            } else if (status === "hash-change") {
                location.hash = url.match(/\#.*/g)[0].replace("#", "");
            } else if (status === "ok") {
                /** Tells the runtime class to parse the incoming HTML for any new CSS files */
                message({
                    recipient: "runtime",
                    type: "parse",
                    data: {
                        body: body,
                        requestUid: requestId,
                    },
                });
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
        const request = this.getNavigaitonRequest(requestUid);
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
                        selectors.push(`[pjax-id="${currentViews[i].getAttribute("pjax-id")}"]`);
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

            message({
                recipient: "pjax",
                type: "finalize-pjax",
                data: {
                    url: request.url,
                    title: tempDocument.title,
                    history: request.history,
                    customPageJumpOffset: request.customPageJumpOffset,
                },
            });
            message({
                recipient: "runtime",
                type: "mount-components",
            });
            message({
                recipient: "runtime",
                type: "mount-inline-scripts",
                data: {
                    selectors: selectors,
                },
            });

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

    /** Collect primary navigation links and tell the Pjax web worker to prefetch the pages. */
    private prefetchLinks(): void {
        /** Require a service worker & at least a 3g connection & respect the users data saver setting */
        if (env.connection === "2g" || env.connection === "slow-2g" || !("serviceWorker" in navigator) || env.dataSaver) {
            return;
        }
        const urls: Array<string> = [];

        /** Header links */
        const headerLinks = Array.from(document.body.querySelectorAll("header a[href]:not([target]):not([pjax-prefetched]):not(prevent-pjax):not(no-transition)"));
        headerLinks.map((link: HTMLAnchorElement) => {
            link.setAttribute("pjax-prefetched", "true");
            urls.push(link.href);
        });

        /** All other navigation links */
        const navLinks = Array.from(document.body.querySelectorAll("nav a[href]:not([target]):not([pjax-prefetched]):not(prevent-pjax):not(no-transition)"));
        navLinks.map((link: HTMLAnchorElement) => {
            link.setAttribute("pjax-prefetched", "true");
            urls.push(link.href);
        });

        this.worker.postMessage({
            type: "prefetch",
            urls: urls,
        });

        /** Require at least a 4g connection while respecting the users data  */
        if (env.connection === "3g") {
            return;
        }

        const allLinks = Array.from(document.body.querySelectorAll("a[href]:not([target]):not([pjax-prefetched]):not(prevent-pjax):not(no-transition)"));
        allLinks.map((link: HTMLAnchorElement) => {
            link.setAttribute("pjax-prefetched", "true");
            this.io.observe(link);
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
