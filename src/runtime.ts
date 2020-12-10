import { djinnjsOutDir } from "./config";
import { parse } from "./body-parser";

let env = null;
let webComponentManager = null;
let utils = null;

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
    }

    private async init() {
        await parse(document.documentElement);
        await this.setup();
        await this.finalize();
        this.mountComponents();
    }

    private async finalize() {
        const wcmModule = await import(`${location.origin}/${djinnjsOutDir}/web-component-manager.mjs`);
        webComponentManager = new wcmModule.WebComponentManager();
        env.setDOMState("idling");

        utils = await import(`${location.origin}/${djinnjsOutDir}/djinn-utils.mjs`);
        utils.scrollOrResetPage();
    }

    private async setup() {
        const envModule = await import(`${location.origin}/${djinnjsOutDir}/env.mjs`);
        env = envModule.env;
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

    private async mountScripts(selectors) {
        utils.handleInlineScripts(selectors);
    }
}
new Djinn();
