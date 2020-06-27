import { usePjax, useServiceWorker, djinnjsOutDir, usePercentage } from "./config";
import { WorkerResponse } from "./types";

export class Djinn {
    private worker: Worker;
    private loadingMessage: HTMLElement;
    private fetchCSS: Function;
    private env: any;

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
            case "lazy":
                this.handleLazyResponse(response.files);
                break;
            case "eager":
                this.handleEagerResponse(response.files);
                break;
        }
    }

    private async handleLazyResponse(files) {
        await this.fetchCSS(files);
        const envModule = await import(`${location.origin}/${djinnjsOutDir}/env.mjs`);
        // @ts-ignore
        this.env = new envModule.Env();
        this.env.setDOMState("idling");
        if (this.env.connection !== "2g" && this.env.connection !== "slow-2g" && usePjax) {
            await import(`${location.origin}/${djinnjsOutDir}/pjax.mjs`);
        }
        if (useServiceWorker && this.env.threadPool !== 0) {
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
}
