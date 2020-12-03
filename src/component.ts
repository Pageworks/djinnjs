export class Component<ComponentState> extends HTMLElement {
    public state: ComponentState;

    constructor() {
        super();
    }

    public setState(state: Partial<ComponentState>) {
        this.state = Object.assign(this.state, state);
        this.updated();
        this.render();
    }

    public render() {}

    public connected() {}

    public disconnected() {}

    public updated() {}

    connectedCallback() {
        this.connected();
    }

    disconnectedCallback() {
        this.disconnected();
    }
}
