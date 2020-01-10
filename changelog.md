# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

-   Pjax loads inline scripts [#19](https://github.com/Pageworks/djinnjs/issues/19)
    -   Scripts with `src || id || pjax-script-id` attributes are removed and remounted every time the page loads
    -   Scripts with `innerHTML` are remounted every time the page loads
    -   Scripts with `src || id || pjax-script-id` attributes can prevent the remount using the `pjax-prevent-remount` attribute
-   Service Worker redirects [#17](https://github.com/Pageworks/djinnjs/issues/17)

## [0.0.11] - 2020-01-05

### Fixed

-   Content cache bust bug within the service worker

## [0.0.10] - 2020-01-05

### Fixed

-   Pjax no longer attempts to prefetch external webpages
-   Pjax no longer attepts to navigate to external webpages
-   Pjax can handle page jumps [#14](https://github.com/Pageworks/djinnjs/issues/14)
-   Pjax scrolls to the anchor element on page load

## [0.0.9] - 2020-01-03

### Added

-   Moved `fetchCSS` and `fetchJS` into one file [#10](https://github.com/Pageworks/djinnjs/issues/10)
-   Both fetch functions create their own loading animation tickets
-   a `completed` hook to the `runtime` inbox that fires after eager/lazy CSS has loaded and web components have mounted
-   Updated Runtime to use the new fetch functions
-   new `file-loading-value` replaces `page-loading span`
-   new `usePercentage` config value allowing X/Y or X% style for the `file-loading-value` element
-   `file-loading-value` elements state is dynamically set to `'enabled'` during `fetchCSS()`
-   new `file-loading-message` value replaces `page-loading span`
-   `file-loading-message` elements state attribute is dynamically set to `'1' || '2' || '3'`

### Fixed

-   `fetchCSS()` removes `.css` from the filename before fetching
-   `fetchJS()` removes `.js` from the filesname before fetching
-   `fetchCSS` undefined `<page-loading-message>` or `<page-loading> <span>` element bug
-   Fixed an issue where `instanceof` wasn't working as expected when validating config files
-   Fixed an issue where `env.stopLoading()` could stop the `hard-loading` animation

### Deprecated

-   `fetchCSS()` from `fetch-css`
-   `fetchJS()` from `fetch-js`

### Removed

-   `fetchCSS()` no longer queries for `page-loading span`
-   `fetchCSS()` no longer injects `Loading Resources:` into the `file-loading-value` element

## [0.0.8] - 2020-01-02

### Added

-   `disablePjax` setting prevents Pjax from loading
-   `disablePrefetching` setting prevents Pjax from prefetching pages
-   `completed` message is sent to all `pjax` inboxes after Pjax has finished a successful page transition

### Fixed

-   Pjax was alerting the users and caching non-200 status responses during the background revision checks
-   `resources-cachebust.json` will still be generated even when the default Service Worker is disabled

## [0.0.7] - 2019-12-30

### Added

-   [terser](https://www.npmjs.com/package/terser) for JavaScript minification

### Fixed

-   Issue with default cachebust regex check
-   Changed Service Workers Cachebust function to `async/await`
-   Moved exported `MessageData` type definition into the Broadcaster class
-   Production strips all `console.*` logs

### Removed

-   [minify](https://www.npmjs.com/package/minify)

## [0.0.6] - 2019-12-30

### Fixed

-   Service Worker issue [#7](https://github.com/Pageworks/djinnjs/issues/7)

## [0.0.5] - 2019-12-24

### Added

-   Updated readme to match [djinnjs.com](https://djinnjs.com/) homepage
-   Removes all relocated `*.js` and `*.d.ts` files when the `cleanup.js` script runs
-   Adds `.DS_Store` to the `.gitignore` file
-   Pjax ignores HTML Anchor Elements with a `prevent-pjax` attribute or a `no-transition` class
-   Adds `keywords` section to the `package.json`
-   Config defaults `src` to `./src`
-   Adds `defaultTransition` value to the config file and defaults to `fade`

### Fixed

-   Updated `homepage` value in the `package.json`
-   Updated `scripts` in the `package.json`
-   Updated `none` transition to use the provided selector and transition date
-   Merged `noneAuto` and `noneSmooth` into one `none` transition function
-   New `none` transition function accepts `smooth` string as transition data to trigger a smooth scroll behavior
-   Fixed issue where DjinnJS stalled when no JavaScript or CSS files were provided in the `src` directory

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

[unreleased]: https://github.com/pageworks/djinnjs/compare/v0.0.11...HEAD
[0.0.11]: https://github.com/pageworks/djinnjs/compare/v0.0.10...v0.0.11
[0.0.10]: https://github.com/pageworks/djinnjs/compare/v0.0.9...v0.0.10
[0.0.9]: https://github.com/pageworks/djinnjs/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/pageworks/djinnjs/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/pageworks/djinnjs/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/pageworks/djinnjs/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/pageworks/djinnjs/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/pageworks/djinnjs/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/pageworks/djinnjs/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/pageworks/djinnjs/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/pageworks/djinnjs/releases/tag/v0.0.1
