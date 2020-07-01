import { env } from "./env";
import { fetchJS } from "./fetch";
import { WebComponentLoad } from "./types";
import { message } from "../web_modules/broadcaster";

export class WebComponentManager {
    private io: IntersectionObserver;

    constructor() {
        this.io = new IntersectionObserver(this.intersectionCallback);
    }

    private removeRequiredConnections() {
        const webComponentElements = Array.from(document.body.querySelectorAll(`[web-component][required-connection]`));
        for (let i = 0; i < webComponentElements.length; i++) {
            const element = webComponentElements[i];
            element.removeAttribute("required-connection");
        }
    }

    private removePurgeableComponents() {
        const webComponentElements = Array.from(document.body.querySelectorAll(`[web-component][removable]`));
        for (let i = 0; i < webComponentElements.length; i++) {
            const element = webComponentElements[i];
            const requiredConnectionType = element.getAttribute("required-connection") || "4g";
            if (customElements.get(element.tagName.toLowerCase().trim()) === undefined) {
                if (!env.checkConnection(requiredConnectionType)) {
                    this.io.unobserve(element);
                    element.remove();
                }
            }
        }
    }

    public collectWebComponents(inboxUid: string) {
        const sessionChoice = sessionStorage.getItem("connection-choice");
        if (sessionChoice === "1") {
            this.removeRequiredConnections();
            this.handleWebComponents();
            return;
        } else if (sessionChoice === "2") {
            this.removePurgeableComponents();
            this.handleWebComponents();
            return;
        }

        if (env.connection === "2g" || env.connection === "slow-2g" || env.connection === "3g") {
            message({
                recipient: "user-input",
                type: "lightweight-check",
                senderId: inboxUid,
            });
        } else {
            this.handleWebComponents();
        }
    }

    /**
     * When a custom element is observed by the `IntersectionObserver` API unobserve the element and attempt to upgrade the web component.
     * @param entries - an array of `IntersectionObserverEntry` objects
     */
    private intersectionCallback: IntersectionObserverCallback = (entries: Array<IntersectionObserverEntry>) => {
        for (let i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
                const element = entries[i].target;
                const customElement = element.tagName.toLowerCase().trim();
                const requiredConnectionType = element.getAttribute("required-connection") || "4g";

                if (customElements.get(customElement) === undefined) {
                    if (env.checkConnection(requiredConnectionType)) {
                        this.io.unobserve(element);
                        this.upgradeToWebComponent(customElement, element);
                    }
                } else {
                    this.io.unobserve(element);
                    element.setAttribute("component-state", "mounted");
                }
            }
        }
    };

    /**
     * Upgrades a custom element into a web component using the dynamic import syntax.
     * @param customElementTagName - the JavaScript filename
     * @param customElement - the `Element` that has been upgraded
     * @todo Switch to dynamic importing once Edge becomes chromium
     * @see https://v8.dev/features/dynamic-import
     */
    private async upgradeToWebComponent(customElementTagName: string, customElement: Element) {
        const ticket = env.startLoading();
        await fetchJS(customElementTagName);
        customElement.setAttribute("component-state", "mounted");
        env.stopLoading(ticket);
    }

    /**
     * Collect all custom elements tagged with a `web-component` attribute that have not already been tracked.
     * If the custom element is tagged with `loading="eager"` upgrade the custom element otherwise track the
     * custom element with the `IntersectionObserver` API.
     */
    public handleWebComponents(): void {
        const customElements = Array.from(document.body.querySelectorAll("[web-component]:not([component-state])"));
        for (let i = 0; i < customElements.length; i++) {
            const element = customElements[i];
            const loadType = element.getAttribute("loading") as WebComponentLoad;
            const requiredConnectionType = element.getAttribute("required-connection") || "4g";
            console.log(`Required connection: ${requiredConnectionType}`);
            if (loadType === "eager" && env.checkConnection(requiredConnectionType)) {
                const customElement = element.tagName.toLowerCase().trim();
                this.upgradeToWebComponent(customElement, element);
            } else {
                element.setAttribute("component-state", "unseen");
                this.io.observe(customElements[i]);
            }
        }
    }
}
