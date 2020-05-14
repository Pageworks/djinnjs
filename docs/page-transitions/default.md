# Default Transitions

By default the Transition Manager will use the `fade` transition effect. [See here](/configuration#defaulttransition) for details on how to change the default transition.

DjinnJS ships with three transition effects:

### Fade

Fade is the default transition. The transition animation can be controlled by using the HTML attributes `scroll` and `duration`

```typescript
interface Transition{
    scroll: "auto" | "smooth" | "none";
    duration: number; // in milliseconds
}
```

```html
<a href="/" scroll="auto" duration="450">Homepage</a>
```

### Slide

The slide transition will slide the view to the right or left. The transition animation can be controlled by using the HTML attributes `scroll` and `direction`

```typescript
interface Transition{
    scroll: "auto" | "smooth" | "none";
    direction: "right" | "left";
}
```

```html
<a href="/" scroll="auto" direction="right">Homepage</a>
```

### None

The none transition is the fallback for when a developer provides an invalid `pjax-transition` value. It is also the transition effect that is used when the user has a 2g or slow-2g connection. The transition animation can be controlled by using the `scroll` attribute.

```typescript
interface Transition{
    scroll: "auto" | "smooth" | "none";
}
```

```html
<a href="/" scroll="auto">Homepage</a>
```