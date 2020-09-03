import { env, dataSaver } from "./env";
import { fetchJS } from "./fetch";
import { usePjax, useServiceWorker } from "./config";
import { WebComponentManager } from "./web-component-manager";
import { handleInlineScripts } from "./djinn-utils";
import { parse } from "./body-parser";

const webComponentManager = new WebComponentManager();

class Djinn {
    constructor() {
        this.init();

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

        if (env.connection !== "2g" && env.connection !== "slow-2g" && usePjax && !dataSaver) {
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

    private async init() {
        await parse(document.documentElement);
        this.mountComponents();
    }

    private async parseCSS(html: string, requestUid: string = null) {
        const tempDocument: HTMLDocument = document.implementation.createHTMLDocument("djinn-temp-document");
        tempDocument.documentElement.innerHTML = html;
        await parse(tempDocument.documentElement);
        const event = new CustomEvent("pjax:continue", {
            detail: {
                requestUid: requestUid,
            },
        });
        document.dispatchEvent(event);
    }

    private mountComponents() {
        webComponentManager.collectWebComponents();
    }

    private mountScripts(selectors) {
        handleInlineScripts(selectors);
    }
}
new Djinn();
