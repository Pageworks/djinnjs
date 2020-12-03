# Overview

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
    -e, --env           The enviroment settings (env | production)
```

## Supported Environments

-   Modern browsers
-   [Electron](https://electronjs.org/)
-   Edge

## Contributing

We welcome all contributions. Please read our [contributing guideline](/contributing) first. You can submit any changes as [pull requests](https://github.com/Pageworks/djinnjs/pulls) or as [GitHub issues](https://github.com/Pageworks/djinnjs/issues). If you'd like to fix bugs or add new features, check out the [developer guide](/developers), and please follow our [Pull Request](https://djinnjs.com/contributing#branch-organization) principle.
