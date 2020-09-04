# Configuration

Out of the box, DjinnJS does not require a config file. It assumes your source code lives at `./src`, your public directory is `./public`, and the `./public/assets` directory can be deleted and rebuilt by DjinnJS automatically. If the default values do not work for your project proceed with creating a custom configuration file.

## Config File

DjinnJS will look for a `djinn.js` or a `djinnjs.config.js` config file in the project's root directory. You can use a different config file using the `-c` flag.

#### package.json

```json
"scripts": {
    "build": "djinnjs --config ./some-directory/custom-config.js"
}
```

## CLI

```bash
    -c  # Path to the config file
    -e  # The environment context (dev | production)
```

## Settings

Below is a config example displaying every configurable option.

> Please note that throughout the documentation we use Node's built-in [path module](https://nodejs.org/api/path.html). This prevents file path issues between operating systems and allows relative paths to work as expected. See [this section](https://nodejs.org/api/path.html#path_windows_vs_posix) for more info on POSIX vs. Windows paths.

#### djinnjs.config.js

```javascript
module.exports = {
    src: "./src",
    publicDir: "./public",
    outDir: "assets",
    noCachePattern: /(\.json)$|(cachebust\.js)/gi,
    cachebustURL: "/cachebust.json",
    resourcePattern: /(\.js)$|(\.css)$|(\.mjs)$|(\.cjs)$|(\.png)$|(\.jpg)$|(\.gif)$|(\.webp)$|(\.jpeg)$|(\.svg)$/gi,
    serviceWorker: true,
    silent: true,
    env: "production",
    gtagId: "",
    pjax: true,
    predictivePrefetching: true,
    followRedirects: true,
    pageJumpOffset: null,
    minimumConnection: "4g",
    precacheURL: "",
};
```

#### src

Default: `"./src"`

A directories path or an array of directory paths. The `src` directories should contain all the CSS and JS files that are ready for production. See [this section](/getting-started/demo-project) about using DjinnJS with [TypeScript](https://www.typescriptlang.org/) and [SASS](https://sass-lang.com/).

#### publicDir

Default: `"./public"`

A directory path pointing DjinnJS to the location of the public directory. This needs to be the project's web root directory.

#### outDir

Default: `"assets"`

A path string. This is the directory name in the public directory that will be removed and recreated every time the DjinnJS runs. All CSS and JS will be placed here.

#### noCachePattern

Default: `/(\.json)$|(cachebust\.js)/gi`

A RegExp pattern. This RegExp pattern is used to prevent the Service Worker from caching responses. This pattern is tested against all requested URLs and prevents caching when the test returns successfully.

#### cachebustURL

Default: `"/cachebust.json"`

A URL pathname string. This is the location of the cache bust file used to cache bust the content cache. The cache bust file should have these values:

```json
{
    "cacheTimestamp": "1234567890",
    "maximumContentPrompts": "4",
    "contentCacheDuration": "30"
}
```

`maximumContentPrompts` is the number of times a user will be prompted with an update message before the Service Worker clears the entire content cache.

`contentCacheDuration` is the number of days the offline content cache will be used before the Service Worker clears the entire content cache.

#### resourcePattern

Default: `/(\.js)$|(\.css)$|(\.mjs)$|(\.cjs)$|(\.png)$|(\.jpg)$|(\.gif)$|(\.webp)$|(\.jpeg)$|(\.svg)$/gi`

A RegExp pattern. This RegExp pattern is used to determine if the requested file should be stored within the resources cache.

#### serviceWorker

Default: `true`

A boolean. When `false` the Service Worker will not be placed in the public directory.

#### silent

Default: `true`

A boolean. When disabled DjinnJS will log additional console logs.

#### env

Default: `"production"`

A string. This value is used to determine if the JavaScript should be minified and is used by the `Env` class when setting `env.isProduction`.

#### gtagId

A string. This is the ID used for Googles [gtag.js](https://developers.google.com/analytics/devguides/collection/gtagjs).

#### predictivePrefetching

Default: `true`

A boolean. When set to `true` Pjax will prefetch and cache links based on the user's device metrics & active connection.

#### followRedirects

Default: `true`

A boolean. When set to `false` Pjax will not follow redirects and will resort to native browser navigation.

#### pjax

Default: `true`

A boolean. When set to `false` Pjax will not load.

#### pageJumpOffset

Default: `null`

A number. When `null` page jumps scroll the element into the center of the viewport. When a number is provided the element is scrolled to the top of the viewport then the offset is added. Positive numbers move the element up, negative numbers move the element down.

#### minimumConnection

Default: `"4g"`

A [Effective Connection Type](https://wicg.github.io/netinfo/#effectiveconnectiontype-enum). This value will be used as the default `required-connection` attribute when loading Web Components.

#### precacheURL

Default: `""`

A string. When an endpoint is provided the service worker will request the URLs of content and resources that need to be cached using the [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache/addAll).
