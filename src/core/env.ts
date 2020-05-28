type DOMState = "soft-loading" | "hard-loading" | "idling" | "page-loading" | "page-loading-complete";
type NetworkType = "4g" | "3g" | "2g" | "slow-2g";

class Env {
    public connection: NetworkType;
    public cpu: number;
    public memory: number | null;
    public domState: DOMState;
    public dataSaver: boolean;
    public threadPool: number;

    private tickets: Array<string>;

    constructor() {
        this.memory = 4;
        this.cpu = window.navigator?.hardwareConcurrency || 2;
        // Automatically removing 2 since DjinnJS has 2 critical web workers
        this.threadPool = this.cpu - 2;
        this.connection = "4g";
        this.domState = "hard-loading";
        this.dataSaver = false;

        this.tickets = [];

        this.init();
    }

    private init(): void {
        if ("connection" in navigator) {
            // @ts-ignore
            this.connection = window.navigator.connection.effectiveType;
            // @ts-ignore
            this.dataSaver = window.navigator.connection.saveData;
            // @ts-ignore
            navigator.connection.onchange = this.handleNetworkChange;
        }

        if ("deviceMemory" in navigator) {
            // @ts-ignore
            this.memory = window.navigator.deviceMemory;
        }
    }

    private handleNetworkChange: EventListener = () => {
        // @ts-ignore
        this.connection = window.navigator.connection.effectiveType;
    };

    /**
     * Attempts to set the DOM to the `idling` state. The DOM will only idle when all `startLoading()` methods have been resolved.
     * @param ticket - the `string` the was provided by the `startLoading()` method.
     */
    public stopLoading(ticket: string): void {
        if (!ticket || typeof ticket !== "string") {
            console.error(`A ticket with the typeof 'string' is required to end the loading state.`);
            return;
        }

        for (let i = 0; i < this.tickets.length; i++) {
            if (this.tickets[i] === ticket) {
                this.tickets.splice(i, 1);
                break;
            }
        }

        if (this.tickets.length === 0 && this.domState === "soft-loading") {
            this.domState = "idling";
            document.documentElement.setAttribute("state", this.domState);
        }
    }

    /**
     * Sets the DOM to the `soft-loading` state.
     * @returns a ticket `string` that is required to stop the loading state.
     */
    public startLoading(): string {
        if (this.domState !== "hard-loading") {
            this.domState = "soft-loading";
            document.documentElement.setAttribute("state", this.domState);
        }
        const ticket = this.uid();
        this.tickets.push(ticket);
        return ticket;
    }

    public startPageTransition(): void {
        this.domState = "page-loading";
        document.documentElement.setAttribute("state", this.domState);
    }

    public endPageTransition(): void {
        this.domState = "page-loading-complete";
        document.documentElement.setAttribute("state", this.domState);
        setTimeout(() => {
            if (this.tickets.length) {
                this.domState = "soft-loading";
                document.documentElement.setAttribute("state", this.domState);
            } else {
                this.domState = "idling";
                document.documentElement.setAttribute("state", this.domState);
            }
        }, 600);
    }

    /**
     * Quick and dirty unique ID generation.
     * This method does not follow RFC 4122 and does not guarantee a universally unique ID.
     * @see https://tools.ietf.org/html/rfc4122
     */
    public uid(): string {
        return new Array(4)
            .fill(0)
            .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
            .join("-");
    }

    /**
     * Sets the DOMs state attribute.
     * DO NOT USE THIS METHOD. DO NOT MANUALLY SET THE DOMs STATE.
     * @param newState - the new state of the document element
     * @deprecated since version 0.1.0
     */
    public setDOMState(newState: DOMState): void {
        this.domState = newState;
        document.documentElement.setAttribute("state", this.domState);
    }

    /**
     * Reserve a thread in the generic thread pool.
     */
    public reserveThread(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.threadPool - 1 < 0) {
                reject("Thread pool is empty");
            } else {
                this.threadPool--;
                resolve();
            }
        });
    }

    /**
     * Release a thread after terminating a Worker.
     */
    public releaseThread() {
        this.threadPool++;
    }
}
export const env: Env = new Env();
export const uid: Function = env.uid;
export const dataSaver: boolean = env.dataSaver;
