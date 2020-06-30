# Hooks

Everything in DjinnJS uses the messaging system and all the Actors play fair by sending messages to themselves. Below is a list of hooks that can be used:

## Runtime

The Runtime class offers a `completed` hook that fires after all CSS has been loaded and Web Components moutned.

```javascript
inbox(data){
    const { type } = data;
    switch (type) {
        case 'completed':
            // Do something or call a function
            break;
        default:
            return;
    }
}
const inboxUid = hookup('runtime', this.inbox.bind(this));
```

The runtime class will send a message to the `user-input` inbox when the users has a `slow-2g` or `2g` or `3g` connection. Below is an example of how to respond to these messages.

```javascript
import { hookup, reply } from "djinnjs/broadcaster";
inbox(data){
    const { type } = data;
    switch (type) {
        case 'lightweight-check':
            // TODO: Prompt the user to select the lite or full version of the website
            const userChoice = getUserInput();
            if (userChoice === 'lite'){
                reply({
                    replyId: data.replyId,
                    type: 'use-lite,
                });
            }else{
                reply({
                    replyId: data.replyId,
                    type: 'use-full,
                });
            }
            break;
        default:
            return;
    }
}
const inboxUid = hookup('user-input', this.inbox.bind(this));
```

## Pjax

The Pjax class offers a `completed` hook that fires after the page navigaiton has successfully completed. All CSS has been loaded, Web Components mouted, and the windows history has been updated.

```javascript
inbox(data){
    const { type } = data;
    switch (type) {
        case 'completed':
            // Do something or call a function
            break;
        default:
            return;
    }
}
const inboxUid = hookup('pjax', this.inbox.bind(this));
```
