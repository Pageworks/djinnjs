# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

-   Updated readme to match [djinnjs.com](https://djinnjs.com/) homepage
-   Removes all relocated `*.js` and `*.d.ts` files when the `cleanup.js` script runs
-   Adds `.DS_Store` to the `.gitignore` file
-   Pjax ignores HTML Anchor Elements with a `prevent-pjax` attribute or a `no-transition` class
-   Adds `keywords` section to the `package.json`
-   Config defaults `src` to `./src`

### Fixed

-   Updated `homepage` value in the `package.json`
-   Updated `scripts` in the `package.json`

## [0.0.4] - 2019-12-22

### Fixed

-   Removed import statements from Web Workers

## [0.0.3] - 2019-12-22

### Added

-   Adds actor, broadcaster, env, fetch-css, fetch-js, and notify files to the NPM files array

## [0.0.2] - 2019-12-22

### Added

-   `cleanup.js` removes the `dist/` directory before running the TypeScript compiler
-   `relocate.js` copies the importable utility files from the `dist/` directory after running the TypeScript compiler

## [0.0.1] - 2019-12-22

### Added

-   Initial core source code
    -   Runtime
    -   Messaging system
    -   Pjax
    -   Service worker
    -   NotifyJS
    -   Transitions
-   Initial CLI script
    -   DjinnJS command
    -   `-h` handle flag
    -   `-c` config flag
    -   `-e` enviroment flag
    -   Base DjinnJS configuration file
    -   Intial DjinnJS compiler scripts

[unreleased]: https://github.com/pageworks/djinnjs/compare/v0.0.2...HEAD
[0.0.4]: https://github.com/pageworks/djinnjs/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/pageworks/djinnjs/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/pageworks/djinnjs/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/pageworks/djinnjs/releases/tag/v0.0.1
