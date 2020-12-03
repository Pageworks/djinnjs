# Configuration

Out of the box, DjinnJS does not require a config file. It assumes your source code lives at `./src`, your public directory is `./public`, and the `./public/assets` directory can be deleted and rebuilt by DjinnJS automatically. If the default values do not work for your project proceed with creating a custom configuration file.

## Config File

DjinnJS will look for a `djinn.js` or a `djinnjs.config.js` config file in the project's root directory. You can use a different config file using the `-c` flag.

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
    silent: true,
    env: "production",
    minimumConnection: "4g",
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

#### silent

Default: `true`

A boolean. When disabled DjinnJS will log additional console logs.

#### env

Default: `"production"`

A string. This value is used to determine if the JavaScript should be minified and is used by the `Env` class when setting `env.isProduction`.

#### minimumConnection

Default: `"4g"`

A [Effective Connection Type](https://wicg.github.io/netinfo/#effectiveconnectiontype-enum). This value will be used as the default `required-connection` attribute when loading Web Components.
