# Loading Animation

A loading animation can be triggered by the Env class whenever `env.startLoading()` is called. The DOM's state attribute will be is set to `loading` which can be used to enable an infinite loading animation.

```scss
infinite-loading-animation {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;

    html[state="loading"] & {
        visibility: visible;
        opacity: 1;
        pointer-events: all;
    }
}
```
