# DjinnJS

DjinnJS is an ES Module framework designed to assist developers in building performance-focused websites and web applications. Check out the project on [GitHub](https://github.com/Pageworks/djinnjs) or [NPM](https://www.npmjs.com/package/djinnjs).

## Features

-   Just In Time Resouce Fetching
-   Offline First Content Strategy
-   Pjax Navigation
-   ES Module Imports
-   Persistent State with Server Side Rendering
-   Context-Specific Progressive Enhancements
-   An Actor Model based Messaging System

## Installation

Download from NPM:

```sh
npm i -D djinnjs
```

## Usage

Setup the DjinnJS config file. [Click here](https://djinnjs.com/configuration) to view the configuration documentation.

```javascript
module.exports = {
    src: "./src",
};
```

Include the runtime JavaScript:

```html
<script type="module" src="/assets/bootstrap.mjs"></script>
```

Inlcude the noscript CSS file:

```html
<noscript>
    <link rel="stylesheet" href="/assets/noscript.css" />
</noscript>
```

Run the DjinnJS command:

```sh
djinnjs
```

## CLI

```bash
    -c, --config        Path to the config file
    -h, --handle        The site handle that will be compiled
    -e, --env           The enviroment settings (env | production)
```

## Environment Support

-   Modern browsers
-   [Electron](https://electronjs.org/)
-   Edge (IE 12) with [polyfills](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs)

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/) | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/) | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/) | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/) | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/) | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/electron/electron_48x48.png" alt="Electron" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/) |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chromium Edge                                                                                                                                                                                     | last 2 versions                                                                                                                                                                                       | last 2 versions                                                                                                                                                                                    | last 2 versions                                                                                                                                                                                    | last 2 versions                                                                                                                                                                                 | last 2 versions                                                                                                                                                                                          |

## Contributing

We welcome all contributions. Please read our [contributing guideline](https://github.com/Pageworks/djinnjs-docs/blob/master/docs/contributing.md) first. You can submit any changes as [pull requests](https://github.com/Pageworks/djinnjs/pulls) or as [GitHub issues](https://github.com/Pageworks/djinnjs/issues). If you'd like to fix bugs or add new features, check out the [developer guide](https://djinnjs.com/developer-guide) and please follow our [Pull Request](https://djinnjs.com/contributing#branch-organization) principle.

## References

-   [JINT Methodology](https://jintmethod.dev/)
-   [RAIL Model](https://developers.google.com/web/fundamentals/performance/rail)
-   [Actor Model](https://dassur.ma/things/actormodel/)
-   [Main Thread is Overworked](https://www.youtube.com/watch?v=7Rrv9qFMWNM)
