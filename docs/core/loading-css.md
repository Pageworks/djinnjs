# Loading CSS

The `css` attribute is used to request all non-critical CSS files. These files are requested when the DOM state transitions from `hard-loading` into `soft-loading`. Any critical CSS (anything visibible above the fold) should be loaded using a `<link>` element or should be injected into a `<style>` element within the documents head on the server.

```html
<header>
    ...snip...
</header>
<main>
    <hero-area>
        ...snip...
    </hero-area>
    <!-- Below the fold -->
    <section css="section-css buttons">
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
