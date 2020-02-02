import { hookup, disconnect } from "../web_modules/broadcaster";
import { debug } from "./env.js";

export class Actor extends HTMLElement {
    public inboxId: string;
    private inboxName: string;

    constructor(inboxName: string) {
        super();
        this.inboxName = inboxName;
    }

    // eslint-disable-next-line
    public inbox(data): void {}
    public connected(): void {}
    public disconnected(): void {}

    private connectedCallback() {
        if (!this.inboxName) {
            if (debug) {
                console.warn(`This actor is missing an inbox name. Did you forget to call the classes constructor?`);
            }
            this.inboxName = "nil";
        }
        this.inboxId = hookup(this.inboxName, this.inbox.bind(this));
        this.connected();
    }

    private disconnectedCallback() {
        disconnect(this.inboxId);
        this.disconnected();
    }
}
