import { hookup, message } from "../web_modules/broadcaster";
import { env, uid } from "./env";
import { sendPageView, setupGoogleAnalytics } from "./gtags.js";
import { gaId, followRedirects, doPrefetching, pageJumpOffset } from "./config";
import { notify } from "../web_modules/@codewithkyle/notifications";
import { fetchCSS } from "./fetch";

interface PjaxState {
    activeRequestUid: string;
}

interface NavigaitonRequest {
    body?: string;
    title?: string;
    url: string;
    history: "push" | "replace";
    requestUid: string;
    transition: string | null;
    transitionData: string | null;
    target: HTMLElement | null;
    targetSelector: string;
    tickets: string[];
    customPageJumpOffset: number;
}

class Pjax {
    private state: PjaxState;
    private serviceWorker: ServiceWorker;
    private navigationRequestQueue: Array<NavigaitonRequest>;
    private io: IntersectionObserver;

    constructor() {
        this.state = {
            activeRequestUid: null,
        };
        this.serviceWorker = null;
        this.navigationRequestQueue = [];
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
        hookup("pjax", this.inbox.bind(this));

        /** Prepare Google Analytics */
        setupGoogleAnalytics(gaId);

        /** Add event listeners */
        window.addEventListener("popstate", this.windowPopstateEvent);
        /** Update the history state with the required `state.url` value */
        window.history.replaceState({ url: window.location.href }, document.title, window.location.href);
        fetchCSS("pjax-notification");
    }

    /**
     * The public inbox for the Pjax class. All incoming messages sent through the `Broadcaster` will be received here.
     * @param data - the `MessageData` passed into the inbox by the `Broadcaster` class
     */
    private inbox(data): void {
        const { type } = data;
        switch (type) {
            case "init-worker":
                this.serviceWorker = navigator.serviceWorker.controller;
                navigator.serviceWorker.onmessage = this.handleServiceWorkerMessage.bind(this);
                this.serviceWorker.postMessage({
                    type: "cachebust",
                    url: window.location.href,
                });
                this.checkPageRevision();
                break;
            case "revision-check":
                this.checkPageRevision();
                break;
            case "hijack-links":
                this.collectLinks();
                break;
            case "load":
                this.navigate(data.url, data?.transition, data?.transitionData, data?.history, data?.selector, data?.navRequestId, data?.tickets, data?.customPageJumpOffset);
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

    /**
     * Handles messages from the Service Worker.
     * @param e - the `MessageEvent` object
     */
    private handleServiceWorkerMessage(e: MessageEvent): void {
        const { type } = e.data;
        switch (type) {
            case "page-refresh":
                let promptCount = parseInt(sessionStorage.getItem("prompts"));
                promptCount = promptCount + 1;
                sessionStorage.setItem("prompts", `${promptCount}`);
                notify({
                    message: "A new version of this page is available.",
                    closeable: true,
                    force: true,
                    duration: Infinity,
                    buttons: [
                        {
                            label: "Reload",
                            callback: () => {
                                window.location.reload();
                            },
                        },
                    ],
                });
                break;
            case "cachebust":
                sessionStorage.setItem("maxPrompts", `${e.data.max}`);
                const currentPromptCount = sessionStorage.getItem("prompts");
                if (parseInt(currentPromptCount) >= e.data.max) {
                    sessionStorage.setItem("prompts", "0");
                    this.serviceWorker.postMessage({
                        type: "clear-content-cache",
                    });
                }
                const contentCacheTimestap = parseInt(localStorage.getItem("contentCache"));
                const difference = Date.now() - contentCacheTimestap;
                const neededDifference = e.data.contentCacheExpires * 24 * 60 * 60 * 1000;
                if (difference >= neededDifference) {
                    localStorage.setItem("contentCache", `${Date.now()}`);
                    this.serviceWorker.postMessage({
                        type: "clear-content-cache",
                    });
                }
                break;
            case "revision-check":
                if (e.data.status === "stale") {
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
        transition: string = null,
        transitionData: string = null,
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
            transition: transition,
            transitionData: transitionData,
            target: document.body.querySelector(`[navigation-request-id="${requestUid}"]`) || null,
            targetSelector: selector,
            tickets: tickets,
            customPageJumpOffset: customPageJumpOffset,
        };
        this.navigationRequestQueue.push(navigationRequest);
        this.serviceWorker.postMessage({
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
                transition: target.getAttribute("pjax-transition"),
                transitionData: target.getAttribute("pjax-transition-data"),
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
            let selector;
            let currentMain: HTMLElement;
            if (request.targetSelector !== null) {
                selector = `[pjax-id="${request.targetSelector}"]`;
                currentMain = document.body.querySelector(selector);
            } else {
                selector = "main";
                currentMain = document.body.querySelector(selector);
                const mainId = currentMain.getAttribute("pjax-id");
                if (mainId) {
                    selector = `[pjax-id="${mainId}"]`;
                }
            }

            if (!currentMain) {
                console.error(`${location.href} is missing selector ${selector}`);
                window.location.href = request.url;
                return;
            }

            currentMain.innerHTML = "";
            const tempDocument: HTMLDocument = document.implementation.createHTMLDocument("pjax-temp-document");
            tempDocument.documentElement.innerHTML = request.body;
            const incomingMain = tempDocument.querySelector(selector) as HTMLElement;

            if (!incomingMain) {
                console.error(`New page is missing selector ${selector}`);
                window.location.href = request.url;
                return;
            }

            currentMain.innerHTML = incomingMain.innerHTML;
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
                    selector: selector,
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
        this.serviceWorker.postMessage({
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

        /** Send the requested URLs to the Pjax web worker */
        this.serviceWorker.postMessage({
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
            this.serviceWorker.postMessage({
                type: "prefetch",
                urls: urls,
            });
        }
    }
    private handleIntersection: IntersectionObserverCallback = this.prefetchLink.bind(this);
}
new Pjax();
