import { env } from "./env";
import { fetchCSS, fetchJS } from "./fetch";
import { djinnjsOutDir, usePjax, useServiceWorker } from "./config";
import { WebComponentManager } from "./web-component-manager";
import { handleInlineScripts } from "./djinn-utils";
import { WorkerResponse } from "./types";

const webComponentManager = new WebComponentManager();

class Djinn {
    private worker: Worker;

    constructor() {
        this.worker = new Worker(`${location.origin}/${djinnjsOutDir}/djinn-worker.mjs`);
        this.worker.onmessage = this.workerInbox.bind(this);
        this.worker.postMessage({
            type: "parse",
            body: document.documentElement.innerHTML,
        });

        document.addEventListener("djinn:use-full", () => {
            sessionStorage.setItem("connection-choice", "full");
            webComponentManager.collectWebComponents();
        });
        document.addEventListener("djinn:use-lite", () => {
            sessionStorage.setItem("connection-choice", "lite");
            webComponentManager.collectWebComponents();
        });
        document.addEventListener("djinn:mount-components", this.mountComponents);
        document.addEventListener("djinn:mount-scripts", (e: CustomEvent) => {
            this.mountScripts(e.detail.selectors);
        });
        document.addEventListener("djinn:parse", (e: CustomEvent) => {
            this.parseCSS(e.detail.body, e.detail.requestUid);
        });

        if (env.connection !== "2g" && env.connection !== "slow-2g" && usePjax) {
            fetchJS("pjax").then(() => {
                const event = new CustomEvent("pjax:init");
                document.dispatchEvent(event);
            });
        }
        if (useServiceWorker && env.threadPool !== 0) {
            fetchJS("service-worker-bootstrap");
        } else {
            const event = new CustomEvent("pjax:init");
            document.dispatchEvent(event);
        }
    }

    private async workerInbox(e: MessageEvent) {
        const response: WorkerResponse = e.data;
        switch (response.type) {
            case "load":
                // Request UID is null when this is the applications initial load request
                if (response.requestUid === null) {
                    await this.loadCSSFiles(response.files);
                    this.mountComponents();
                } else {
                    this.loadCSSFiles(response.files, response.requestUid);
                }
                break;
        }
    }

    private async loadCSSFiles(files: Array<string>, requestUid: string = null) {
        await fetchCSS(files);
        if (requestUid) {
            const event = new CustomEvent("pjax:continue", {
                detail: {
                    requestUid: requestUid,
                },
            });
            document.dispatchEvent(event);
        }
    }

    public parseCSS(html: string, requestUid: string = null): void {
        this.worker.postMessage({
            type: "parse",
            body: html,
            requestUid: requestUid,
        });
    }

    public mountComponents() {
        webComponentManager.collectWebComponents();
    }

    public mountScripts(selectors) {
        handleInlineScripts(selectors);
    }
}
new Djinn();
