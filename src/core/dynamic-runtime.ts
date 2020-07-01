import { usePjax, useServiceWorker, djinnjsOutDir, usePercentage } from "./config";
import { WorkerResponse, PjaxResources } from "./types";

declare const globalMessage: Function;
declare const globalHookup: Function;

let env = null;
let webComponentManager = null;

class Djinn {
    private worker: Worker;
    private loadingMessage: HTMLElement;
    private fetchCSS: Function;
    private inboxUid: string;

    constructor() {
        this.worker = null;

        window.addEventListener("load", this.handleLoadEvent);

        this.loadingMessage = document.body.querySelector("djinnjs-file-loading-message") || null;
        if (this.loadingMessage) {
            this.loadingMessage.setAttribute("state", "1");
        }
    }

    private workerInbox(e: MessageEvent) {
        const response: WorkerResponse = e.data;
        switch (response.type) {
            case "parse":
                this.handlePjaxResponse(response.pjaxFiles, response.requestUid);
                break;
            case "lazy":
                this.handleLazyResponse(response.files);
                break;
            case "eager":
                this.handleEagerResponse(response.files);
                break;
        }
    }

    private inbox(data) {
        switch (data.type) {
            case "use-full":
                sessionStorage.setItem("connection-choice", "1");
                webComponentManager.collectWebComponents();
                break;
            case "use-lite":
                sessionStorage.setItem("connection-choice", "0");
                webComponentManager.collectWebComponents();
                break;
            case "mount-components":
                webComponentManager.collectWebComponents();
                break;
            case "mount-inline-scripts":
                this.mountInlineScripts(data.selector);
                break;
            case "parse":
                this.loadCSS(data.body, data.requestUid);
                break;
            default:
                break;
        }
    }

    private async mountInlineScripts(selector) {
        const module = await import(`${location.origin}/${djinnjsOutDir}/djinn-utils.mjs`);
        module.handleInlineScripts(selector);
    }

    private async handlePjaxResponse(data: PjaxResources, requestUid: string) {
        await this.fetchCSS(data.eager);
        globalMessage({
            recipient: "pjax",
            type: "css-ready",
            data: {
                requestUid: requestUid,
            },
        });
        await this.fetchCSS(data.lazy);
    }

    private async handleLazyResponse(files) {
        await this.fetchCSS(files);

        const envModule = await import(`${location.origin}/${djinnjsOutDir}/env.mjs`);
        env = envModule.env;

        await import(`${location.origin}/${djinnjsOutDir}/broadcaster.mjs`);
        this.inboxUid = globalHookup("runtime", this.inbox.bind(this));

        const wcmModule = await import(`${location.origin}/${djinnjsOutDir}/web-component-manager.mjs`);
        webComponentManager = new wcmModule.WebComponentManager();
        env.setDOMState("idling");
        webComponentManager.handleWebComponents();

        if (env.connection !== "2g" && env.connection !== "slow-2g" && usePjax) {
            await import(`${location.origin}/${djinnjsOutDir}/pjax.mjs`);
            globalMessage({
                recipient: "pjax",
                type: "init",
                maxAttempts: Infinity,
            });
        }

        if (useServiceWorker && env.threadPool !== 0) {
            await import(`${location.origin}/${djinnjsOutDir}/service-worker-bootstrap.mjs`);
        }
    }

    private handlePageScrollPosition(): void {
        if (window.location.hash) {
            /** Scroll to hash element */
            const element = document.body.querySelector(window.location.hash);
            if (element) {
                element.scrollIntoView();
                return;
            }
        }
        /** Scroll to top of page */
        window.scrollTo(0, 0);
    }

    private async handleEagerResponse(files) {
        const loadingMessage = document.body.querySelector("djinnjs-file-loading-value") || null;
        if (document.documentElement.getAttribute("state") === "hard-loading" && this.loadingMessage) {
            this.loadingMessage.setAttribute("state", "3");
            this.loadingMessage.innerHTML = `Loading resources:`;
            if (loadingMessage && usePercentage) {
                loadingMessage.innerHTML = `0%`;
                loadingMessage.setAttribute("state", "enabled");
            } else if (loadingMessage) {
                loadingMessage.innerHTML = `0/${files.length}`;
                loadingMessage.setAttribute("state", "enabled");
            }
        }
        const fetchModule = await import(`${location.origin}/${djinnjsOutDir}/fetch.mjs`);
        this.fetchCSS = fetchModule.fetchCSS;
        await this.fetchCSS(files);
        this.handlePageScrollPosition();
        document.documentElement.setAttribute("state", "soft-loading");
        this.worker.postMessage({
            type: "lazy",
            body: document.body.innerHTML,
        });
    }

    private handleLoadEvent: EventListener = async () => {
        this.worker = new Worker(`${location.origin}/${djinnjsOutDir}/djinn-worker.mjs`);
        this.worker.onmessage = this.workerInbox.bind(this);
        this.worker.postMessage({
            type: "eager",
            body: document.body.innerHTML,
        });
    };

    public loadCSS(body: string, requestUid: string): void {
        this.worker.postMessage({
            type: "parse",
            body: body,
            requestUid: requestUid,
        });
    }
}
const djinnjs = new Djinn();
const loadCSS: (body: string, requestUid: string) => void = djinnjs.loadCSS.bind(djinnjs);
export { djinnjs, loadCSS };
