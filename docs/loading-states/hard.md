# Hard Loading

The hard loading animation is used to hide the page while critical CSS is loading. Animations are controlled by the documents `state` attribute. The hard loading animation should play whenever the `state` is set to `hard-loading` value. The hard loading animation should not be manually triggered.

A file/percentage counter can be displayed by adding a `<djinnjs-file-loading-value>` element.

DjinnJS does not require any specific HTML or CSS to run. It's recommended you use the example below or you create your loading animation.

```sass
page-loading-animation {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;

    html[state="hard-loading"] & {
        visibility: visible;
        opacity: 1;
        pointer-events: all;
    }
}
```
