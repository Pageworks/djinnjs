## NPM

Download from NPM:

```bash
npm i -D djinnjs
```

Setup the DjinnJS config file, see [configuration](/configuration) for additional information.

```javascript
module.exports = {
    src: './src'
}
```

Run the build command:

```bash
djinnjs
```

Include the runtime JavaScript:

```html
<script type="module" src="/assets/runtime.mjs"></script>
```

Inlcude the noscript CSS file:

```html
<noscript>
    <link rel="stylesheet" href="/assets/noscript.css">
</noscript>
```

Include the Web Component polyfill if you need to support IE 12 (Edge):

```html
<script>
    if (typeof CustomElementRegistry === 'undefined') {
        document.write('<script src="https://unpkg.com/@webcomponents/webcomponentsjs@2.4.0/webcomponents-bundle.js"><\/script>');
    }
</script>
```

## Manual

Download the latest release from [GitHub](https://github.com/Pageworks/djinnjs/releases) and place the `dist/` directory within your project.
