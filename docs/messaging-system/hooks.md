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