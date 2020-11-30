# DjinnJS

DjinnJS is a lightweight JavaScript & CSS bootstraper built on ES Modules and Web Components.

## Features

-   Just In Time Resouce Fetching
-   ES Module Imports
-   Context-Specific Progressive Enhancements

## Installation

Download from NPM:

```sh
npm i -D djinnjs
```

## Usage

Setup the DjinnJS config file. [View the configuration documentation](https://djinnjs.com/configuration).

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

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](#) | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](#) | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](#) | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](#) | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](#) | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/electron/electron_48x48.png" alt="Electron" width="24px" height="24px" />](#) |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| last 2 versions                                                                                                                                                                                     | last 2 versions                                                                                                                                                                                       | last 2 versions                                                                                                                                                                                    | last 2 versions                                                                                                                                                                                    | last 2 versions                                                                                                                                                                                 | last 2 versions                                                                                                                                                                                          |

## Contributing

We welcome all contributions. Please read our [contributing guideline](https://github.com/Pageworks/djinnjs-docs/blob/master/docs/contributing.md) first. You can submit any changes as [pull requests](https://github.com/Pageworks/djinnjs/pulls) or as [GitHub issues](https://github.com/Pageworks/djinnjs/issues). If you'd like to fix bugs or add new features, check out the [developer guide](https://djinnjs.com/developer-guide) and please follow our [Pull Request](https://djinnjs.com/contributing#branch-organization) principle.
