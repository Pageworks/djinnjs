# Creating Stateful Web Components

To create a component that maintains a state for client-side rendering extend the `Component` class.

```typescript
import { Component } from "djinnjs/component";

type Card = {
    title: string;
    description: string;
    link: string;
}

type ExampleComponentState = {
    view: "loading" | "idling";
    cards: Array<Card>;
};


export default class ExampleComponent extends Component<ExampleComponentState>{
    constructor(){
        super();
        this.state = {
            view: "loading",
            cards: [],
        };
        this.fetchCards();
    }

    private async fetchCards(){
        const request = await fetch("/api/cards.json", {
            headers: new Headers({
                Accept: "application/json",
            }),
        });
        if (request.ok){
            const response = await request.json();
            this.setState({
                cards: response,
                view: "idling",
            });
        }
    }

    render(){
        // TODO: render cards using this.state.cards
    }

    updated(){
        // TODO: something when the state updates
    }

    connected(){
        // TODO: something when the web component is mounted
    }

    disconnected(){
        // TODO: something when the web component is unmounted
    }
}
```