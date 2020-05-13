# Actors

When creating Web Component actors an Actor class is available to be extended. In the example below the `connected()` and `disconnected()` methods are optional and the `constructor()` must be called along with providing and inbox alias to the `super()` method.

```javascript
import { Actor } from 'djinnjs/actor';
class CustomActorComponent extends Actor {
    constructor(){
        // Super requires the inboxes alias
        super('custom-actor');
    }

    inbox(data){ 
        const { type } = data;
        switch (type) {
            default:
                return;
        }
    }

    connected(){
        // Do something with the Web Components connectedCallback() method
    }

    disconnected(){
        // Do something with the Web Components disconnectedCallback() method
    }
}
```