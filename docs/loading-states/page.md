# Page Loading

The page loading animation is used by the Pjax class and should not be manually triggered.

Animations are controlled by the documents `state` attribute. The page loading animation should play whenever the `state` is set to `page-loading` value.

```sass
page-loading-animation {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;

    html[state="page-loading"] & {
        visibility: visible;
        opacity: 1;
        pointer-events: all;
    }
}
```

The page loading animation has an additional state of `page-loading-complete` and is set once the page has successfully swapped to the new page. The complete state last 600ms before resuming the `soft-loading` or `idling` state. Ideally, the completed state should be used to finish the "hanging" animation. For more information about designing for speed and hacking user perception [watch this video](https://youtu.be/0-3GBgRg9ow).
