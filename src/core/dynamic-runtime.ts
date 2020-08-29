import { usePjax, useServiceWorker, djinnjsOutDir } from "./config";
import { WorkerResponse } from "./types";

let env = null;
let webComponentManager = null;
let utils = null;
let fetchCSS = null;

class Djinn {
    private worker: Worker;

    constructor() {
        this.worker = new Worker(`${location.origin}/${djinnjsOutDir}/djinn-worker.mjs`);
        this.worker.onmessage = this.workerInbox.bind(this);
        this.worker.postMessage({
            type: "parse",
            body: document.documentElement.innerHTML,
        });

        document.addEventListener("djinn:full", () => {
            sessionStorage.setItem("connection-choice", "full");
            webComponentManager.collectWebComponents();
        });
        document.addEventListener("djinn:lite", () => {
            sessionStorage.setItem("connection-choice", "lite");
            webComponentManager.collectWebComponents();
        });
        document.addEventListener("djinn:mount", this.mountComponents);
        document.addEventListener("djinn:scripts", this.mountScripts);
    }

    private async workerInbox(e: MessageEvent) {
        const response: WorkerResponse = e.data;
        switch (response.type) {
            case "load":
                // Request UID is null when this is the applications initial load request
                if (response.requestUid === null) {
                    await this.setup();
                    await this.loadCSSFiles(response.files, response.requestUid);
                    await this.finalize();
                    this.mountComponents();
                } else {
                    this.loadCSSFiles(response.files, response.requestUid);
                }
                break;
        }
    }

    private async finalize() {
        const wcmModule = await import(`${location.origin}/${djinnjsOutDir}/web-component-manager.mjs`);
        webComponentManager = new wcmModule.WebComponentManager();
        env.setDOMState("idling");

        utils = await import(`${location.origin}/${djinnjsOutDir}/djinn-utils.mjs`);
        utils.scrollOrResetPage();

        if (env.connection !== "2g" && env.connection !== "slow-2g" && usePjax) {
            await import(`${location.origin}/${djinnjsOutDir}/pjax.mjs`);
        }

        if (useServiceWorker && env.threadPool !== 0) {
            await import(`${location.origin}/${djinnjsOutDir}/service-worker-bootstrap.mjs`);
        } else {
            const event = new CustomEvent("pjax:init");
            document.dispatchEvent(event);
        }
    }

    private async setup() {
        const envModule = await import(`${location.origin}/${djinnjsOutDir}/env.mjs`);
        env = envModule.env;

        const fetchModule = await import(`${location.origin}/${djinnjsOutDir}/fetch.mjs`);
        fetchCSS = fetchModule.fetchCSS;
    }

    private async loadCSSFiles(data: Array<string>, requestUid: string) {
        const ticket = env.startLoading();
        await fetchCSS(data);
        const event = new CustomEvent("pjax:continue", {
            detail: {
                requestUid: requestUid,
            },
        });
        document.dispatchEvent(event);
        env.stopLoading(ticket);
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

    public async mountScripts(selectors) {
        utils.handleInlineScripts(selectors);
    }
}
const djinn = new Djinn();
const mountComponents: Function = djinn.mountComponents;
const mountScripts: (selectors: Array<string>) => void = djinn.mountScripts;
export { djinn, mountComponents, mountScripts };
