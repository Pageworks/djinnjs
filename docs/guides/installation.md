## NPM

Download from NPM:

```bash
npm i -D djinnjs
```

Prepare the NPM commands:

```json
"scripts": {
    "build": "djinnjs -e dev",
    "production": "djinnjs -e production"
}
```

Run the build command:

```bash
npm run build
```

Include the bootstrap JavaScript and noscript CSS file in your HTML document:

```html
<script type="module" src="/assets/bootstrap.mjs"></script>
<noscript>
    <link rel="stylesheet" href="/assets/noscript.css" />
</noscript>
```

#### Next Steps

-   [Setup the DjinnJS config file](/guides/configuration)
-   [Read the Quick Start Guide](/guides/quick-start-guide)
