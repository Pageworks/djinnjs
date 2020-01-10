import { env } from "./env";
import { broadcaster } from "./broadcaster";
import { fetchCSS, fetchJS } from "./fetch";
import { djinnjsOutDir, disablePjax, usePercentage } from "./config";

interface PjaxResources {
    eager: Array<string>;
    lazy: Array<string>;
}

interface WorkerResponse {
    type: "eager" | "lazy" | "parse";
    files: Array<string>;
    requestUid: string | null;
    pjaxFiles: PjaxResources;
}

type WebComponentLoad = null | "lazy" | "eager";

class Runtime {
    private _bodyParserWorker: Worker;
    private _io: IntersectionObserver;
    private _loadingMessage: HTMLElement;

    constructor() {
        this._bodyParserWorker = new Worker(`${window.location.origin}/${djinnjsOutDir}/runtime-worker.js`);
        this._loadingMessage = document.body.querySelector("djinnjs-file-loading-message") || null;
        if (this._loadingMessage) {
            this._loadingMessage.setAttribute("state", "1");
        }
        window.addEventListener("load", this.handleLoadEvent);
    }

    /**
     * Initializes the Runtime class.
     */
    private init(): void {
        if (this._loadingMessage) {
            this._loadingMessage.innerHTML = "Collecting resources";
            this._loadingMessage.setAttribute("state", "2");
        }
        broadcaster.hookup("runtime", this.inbox.bind(this));
        this._bodyParserWorker.postMessage({
            type: "eager",
            body: document.body.innerHTML,
        });
        this._bodyParserWorker.onmessage = this.handleWorkerMessage.bind(this);
        this._io = new IntersectionObserver(this.intersectionCallback);
    }
    private handleLoadEvent: EventListener = this.init.bind(this);

    /**
     * The public inbox for the Runtime class. All incoming messages sent through the `Broadcaster` will be received here.
     * @param data - the `MessageData` passed into the inbox by the `Broadcaster` class
     */
    private inbox(data: MessageData): void {
        const { type } = data;
        switch (type) {
            case "load":
                fetchCSS(data.resources);
                break;
            case "mount-components":
                this.handleWebComponents();
                break;
            case "parse":
                this.parseHTML(data.body, data.requestUid);
                break;
            case 'mount-inline-scripts':
                this.handleInlineScripts(data.selector);
                break;
            default:
                return;
        }
    }

    /**
     * Handles the incoming message from the Runtime web worker.
     * @param e - the `MessageEvent` object
     */
    private handleWorkerMessage(e: MessageEvent) {
        const response: WorkerResponse = e.data;
        switch (response.type) {
            case "eager":
                const loadingMessage = document.body.querySelector("djinnjs-file-loading-value") || null;
                if (env.domState === "hard-loading" && this._loadingMessage) {
                    this._loadingMessage.setAttribute("state", "3");
                    this._loadingMessage.innerHTML = `Loading resources:`;
                    if (loadingMessage && usePercentage) {
                        loadingMessage.innerHTML = `0%`;
                        loadingMessage.setAttribute("state", "enabled");
                    } else if (loadingMessage) {
                        loadingMessage.innerHTML = `0/${response.files.length}`;
                        loadingMessage.setAttribute("state", "enabled");
                    }
                }
                fetchCSS(response.files).then(() => {
                    env.setDOMState("idling");
                    this._bodyParserWorker.postMessage({
                        type: "lazy",
                        body: document.body.innerHTML,
                    });
                });
                break;
            case "lazy":
                fetchCSS(response.files).then(() => {
                    this.handleWebComponents();
                    if (env.connection !== "2g" && env.connection !== "slow-2g" && !disablePjax) {
                        fetchJS("pjax").then(() => {
                            broadcaster.message(
                                "pjax",
                                {
                                    type: "init",
                                },
                                "Guaranteed",
                                Infinity
                            );
                        });
                    }
                    broadcaster.message("runtime", {
                        type: "completed",
                    });
                });
                break;
            case "parse":
                this.fetchPjaxResources(response.pjaxFiles, response.requestUid);
                break;
            default:
                return;
        }
    }

    /**
     * Looks through the new HTML for any inline scripts and attempts to append them to the documents head.
     */
    private handleInlineScripts(selector: string): void {
        const el = document.body.querySelector(selector);
        if (el) {
            el.querySelectorAll('script').forEach(script => {
                const newScript = document.createElement('script');
                if (script?.src || script?.id || script.getAttribute('pjax-script-id')) {
                    let scriptSelector = 'script';
                    scriptSelector += `[src="${script?.src}"]` || `#${script?.id}` || `[pjax-script-id="${script.getAttribute('pjax-script-id')}"]`;
                    const existingScript = document.head.querySelector(scriptSelector);
                    if (existingScript) {
                        const preventRemount = script.getAttribute('pjax-prevent-remount');
                        if (preventRemount === null) {
                            existingScript.remove();
                            newScript.src = script.src;
                            document.head.appendChild(newScript);
                        }
                    } else {
                        newScript.src = script.src;
                        document.head.appendChild(newScript);
                    }
                } else {
                    newScript.innerHTML = script.innerHTML;
                    document.head.appendChild(newScript);
                }
            });
        }
    }

    private fetchPjaxResources(data: PjaxResources, requestUid: string): void {
        /** Fetch the requested eager CSS files */
        fetchCSS(data.eager).then(() => {
            /** Tell the Pjax class that the eager CSS files have been loaded */
            broadcaster.message("pjax", {
                type: "css-ready",
                requestUid: requestUid,
            });
            fetchCSS(data.lazy);
        });
    }

    /**
     * Passes the HTML parse request onto the Runtime web worker.
     * @param body - the body text to be parsed
     * @param requestUid - the navigation request unique id
     */
    private parseHTML(body: string, requestUid: string): void {
        this._bodyParserWorker.postMessage({
            type: "parse",
            body: body,
            requestUid: requestUid,
        });
    }

    /**
     * Upgrades a custom element into a web component using the dynamic import syntax.
     * @param customElementTagName - the JavaScript filename
     * @param customElement - the `Element` that has been upgraded
     * @todo Switch to dynamic importing once Edge becomes chromium
     * @see https://v8.dev/features/dynamic-import
     */
    private upgradeToWebComponent(customElementTagName: string, customElement: Element): void {
        fetchJS(customElementTagName).then(() => {
            customElement.setAttribute("component-state", "mounted");
        });
    }

    /**
     * When a custom element is observed by the `IntersectionObserver` API unobserve the element and attempt to upgrade the web component.
     * @param entries - an array of `IntersectionObserverEntry` objects
     */
    private handleIntersection(entries: Array<IntersectionObserverEntry>) {
        for (let i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
                this._io.unobserve(entries[i].target);
                const customElement = entries[i].target.tagName.toLowerCase().trim();
                if (customElements.get(customElement) === undefined) {
                    this.upgradeToWebComponent(customElement, entries[i].target);
                } else {
                    entries[i].target.setAttribute("component-state", "mounted");
                }
            }
        }
    }
    private intersectionCallback: IntersectionObserverCallback = this.handleIntersection.bind(this);

    /**
     * Collect all custom elements tagged with a `web-component` attribute that have not already been tracked.
     * If the custom element is tagged with `loading="eager"` upgrade the custom element otherwise track the
     * custom element with the `IntersectionObserver` API.
     */
    private handleWebComponents(): void {
        const customElements = Array.from(document.body.querySelectorAll("[web-component]:not([component-state])"));
        for (let i = 0; i < customElements.length; i++) {
            const element = customElements[i];
            const loadType = element.getAttribute("loading") as WebComponentLoad;
            if (loadType === "eager") {
                const customElement = element.tagName.toLowerCase().trim();
                this.upgradeToWebComponent(customElement, element);
            } else {
                element.setAttribute("component-state", "unseen");
                this._io.observe(customElements[i]);
            }
        }
    }
}
export const runtime: Runtime = new Runtime();
