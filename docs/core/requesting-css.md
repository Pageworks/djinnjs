# Requesting CSS

There are two ways to request CSS, the `eager-load-css` and `lazy-load-css` attributes. Both attributes accept several filenames separated by whitespace.

## Eager

`eager-load-css` attribute is used to request critical CSS. These are the files that must load before the `hard-loading` state can transition into `soft-loading`.

```html
<header eager-load-css="header buttons">
    ...snip...
</header>
```

In the example above the header needs the `header.css` and `buttons.css` files to load before the page can be revealed. Try and limit the number of critical CSS files that are requested. Typically only the elements visible above the fold should request critical CSS.

## Lazy

`lazy-load-css` attribute is used to request all other CSS files. These files are requested when the DOM state transitions from `hard-loading` into `soft-loading`.

```html
<header eager-load-css="header buttons">
    ...snip...
</header>
<main>
    <hero-area eager-load-css="hero-area">
        ...snip...
    </hero-area>
    <!-- Below the fold -->
    <section lazy-load-css="content">
        ...snip...
    </section>
</main>
```

In the example above the hero area and header CSS files will be loaded first and the [First Meaningful Paint](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint) will be delayed until those requests have been resolved. Once the page is revealed the `soft-loading` animation will begin and the lazy CSS files will be requested.