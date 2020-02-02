import { broadcaster } from "./broadcaster";
import { debug } from "./env";

export class Actor extends HTMLElement {
    public inboxId: string;
    private inboxName: string;

    constructor(inboxName: string) {
        super();
        this.inboxName = inboxName;
    }

    // eslint-disable-next-line
    public inbox(data: MessageData): void {}
    public connected(): void {}
    public disconnected(): void {}

    private connectedCallback() {
        if (!this.inboxName) {
            if (debug) {
                console.warn(`This actor is missing an inbox name. Did you forget to call the classes constructor?`);
            }
            this.inboxName = "nil";
        }
        this.inboxId = broadcaster.hookup(this.inboxName, this.inbox.bind(this));
        this.connected();
    }

    private disconnectedCallback() {
        broadcaster.disconnect(this.inboxId);
        this.disconnected();
    }
}
