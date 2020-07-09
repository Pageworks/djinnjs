# Soft Loading

The soft loading animation is used by the Env class. Whenever `env.startLoading()` is called the DOM's state is set to `soft-loading` and unlike the hard loading animation the soft loading state is an infinite loading animation.

Animations are controlled by the documents `state` attribute. The soft loading animation should play whenever the `state` is set to `soft-loading`

```scss
infinite-loading-animation {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;

    html[state="soft-loading"] & {
        visibility: visible;
        opacity: 1;
        pointer-events: all;
    }
}
```
