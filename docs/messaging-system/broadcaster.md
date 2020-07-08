# Broadcaster

The Broadcaster class is the [Actor Model](/messaging/actor-model) implemented as a JavaScript based messaging system. It provides three functions that can be used to handle all messages between controllers and Actors.

```javascript
import { hookup, disconnect, message } from "djinnjs/broadcaster";
```

## Hookup

The `hookup()` method is used to hookup an inbox to the messaging system. It requires an inbox alias and the inbox function.

```javascript
function inbox(data) {
    const { type } = data;
    switch (type) {
        default:
            return;
    }
}

const inboxUid = hookup("example", this.inbox.bind(this));
```

In the example above an inbox with the alias **example** is registered with the messaging system.

> Note: An inbox alias is not unique. Any message sent to the **example** inbox will be delivered to all inboxes labeled as **example**.

## Disconnect

The `disconnect()` method is used to disconnect an inbox from the messaging system. It requires the inbox unique ID that was provided from the hookup.

```javascript
class ExampleComponent extends HTMLElement {
    connectedCallback() {
        this.inboxUid = hookup("example", this.inbox.bind(this));
    }
    disconnectedCallback() {
        disconnect(this.inboxUid);
    }
}
```

## Memory Management

The Broadcaster will purge disconnected inboxes every 5 minutes on high-end devices and every 1 minute on low-end devices. Device status is determined by the amount of available memory. To trigger a purge send a `cleanup` message to the Broadcaster.

```javascript
message("broadcaster", { type: "cleanup" });
```
