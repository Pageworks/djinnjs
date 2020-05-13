# Configuration

Out of the box, DjinnJS does not require a config file. It assumes your source code lives at `./src`, your public directory is `./public`, and the `./public/assets` directory can be deleted and rebuilt by DjinnJS automatically. If the default values are incorrect for your project please proceed with creating a custom configuration file.

## Config File

DjinnJS will look for a `djinn.js` or a `djinnjs.config.js` config file in the projects root directory. You can use a different config file using the `-c` or `--config` flags.

#### package.json

```json
"scripts": {
    "build": "djinnjs --config ./some-directory/custom-config.js"
}
```

## CLI

```bash
    -c, --config        Path to the config file
    -h, --handle        The site handle that will be compiled
    -e, --env           The enviroment settings (env | production)
```

## Settings

Below is a config example displaying every configurable option.

> Please note that throughout the documentation we use Node's built-in [path module](https://nodejs.org/api/path.html). This prevents file path issues between operating systems and allows relative paths to work as expected. See [this section](https://nodejs.org/api/path.html#path_windows_vs_posix) for more info on POSIX vs. Windows paths.

#### djinnjs.config.js

```javascript
module.exports = {
    src: './src',
    publicDir: './public',
    outDir: 'assets',
    noCachePattern: /(\.json)$|(cachebust\.js)/gi,
    cachebustURL: '/cachebust.json',
    disableServiceWorker: false,
    silent: true,
    env: 'production',
	gtagId: '',
    defaultTransition: 'fade',
    disablePrefetching: false,
    followRedirects: true,
    disablePjax: false,
    usePercentage: false,
    transitions: [
        {
            handle: '',
            file: '',
        }
    ]
}
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

#### disableServiceWorker

Default: `false`

A boolean. When disabled the Service Worker will not be placed in the public directory. The Service Worker is required for the offline-first content strategy.

#### silent

Default: `true`

A boolean. When disabled DjinnJS will log additional console logs.

#### env

Default: `"production"`

A string. This value is used to determine if the JavaScript should be minified and is used by the `Env` class when setting `env.isProduction`.

#### gtagId

A string. This is the ID used for Googles [gtag.js](https://developers.google.com/analytics/devguides/collection/gtagjs).

#### defaultTransition

Default: `"fade"`

A transition handle string. This value is used to determine what the default page transition effect will be for the site. [Click here](/transitions) for more information about page transitions.

#### disablePrefetching

Default: `false`

A boolean. When set to `true` Pjax will not prefetch and cache links.

#### followRedirects

Default: `true`

A boolean. When set to `false` Pjax will not follow redirects and will resort to native browser navigation.

#### disablePjax

Default: `false`

A boolean. When set to `true` Pjax will not load.

#### usePercentage

Default: `false`

A boolean. This value is used to determine if the `<file-loading-value>` element should be injected with the X/Y format or the X% format.

#### transitions

An array of transitions. See [this page](/transitions) for more information about creating custom page transitions.
