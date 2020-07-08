# Requesting CSS

There are two ways to request CSS, the `eager-css` and `lazy-css` attributes. Both attributes accept several filenames separated by whitespace.

## Eager

`eager-css` attribute is used to request critical CSS. These are the files that must load before the `hard-loading` state can transition into `soft-loading`. Try to limit the number of critical CSS files that are requested to only elements visible above the fold.

```html
<header eager-css="header buttons">
    ...snip...
</header>
```

## Lazy

`lazy-css` attribute is used to request all other CSS files. These files are requested when the DOM state transitions from `hard-loading` into `soft-loading`.

```html
<header eager-css="header buttons">
    ...snip...
</header>
<main>
    <hero-area eager-css="hero-area">
        ...snip...
    </hero-area>
    <!-- Below the fold -->
    <section lazy-css="content">
        ...snip...
    </section>
</main>
```

## Manual

CSS can be manually loaded using JavaScript and the `fetchCSS` function.

```javascript
import { fetchCSS } from "djinnjs/fetch";

fetchCSS(["file1", "file2"]).then(() => {
    console.log("All CSS files have loaded");
});
```
