## Lazy Loading Images

Lazy load images using the loading attribute.

```html
<img src="image.png" loading="lazy" alt="…" width="200">
```

For a better user experience add a simple fade transition:

```html
<img src="image.png" loading="lazy" alt="…" width="200" style="opacity:0;transition:opacity 150ms ease-in;" onload="this.style.opacity = '1';">
```

When using the `onload` attribute add a fallback style for users that have JavaScript disabled:

```html
<noscript>
    <style>
        img{
            opacity: 1 !important;
        }
    </style>
</noscript>
```

[Click here](https://web.dev/native-lazy-loading/) to learn more about native lazy loading.
