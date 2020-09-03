# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

-   `css` attribute
-   custom event listeners -- attached to the `document`
    -   `djinn:mount-components`
    -   `djinn:parse`
    -   `djinn:use-full`
    -   `djinn:use-lite`
    -   `pjax:init`
    -   `pjax:load`
    -   `pjax:revision`
    -   `pjax:continue`
-   pjax prefetches pages on `mouseenter` event (network & data save mode restrictions still enforced)

### Removed

-   Broadcaster
    -   `djinnjs/broadcaster` export
    -   `pjax` inbox hooks
    -   `runtime` inbox hooks
    -   `user-input` inbox hooks
-   `hard-loading` stage of the DjinnJS runtime -- eager CSS **MUST** be loaded via `<link>` elements or injected into the document using `<style>` elements
-   support for the `hard-loading` animation & elements
-   pjax no longer queues and prefetches navigation links
-   djinnjs web worker -- replaced regex with query selector

### Depricated

-   `eager-css` attribute
-   `lazy-css` attribute

## [0.1.3] - 2020-08-28

### Added

-   added the ability to swap multiple views during a page transition
-   added `<body>` fallback when no `pjax-id` attributes or a `<main>` element isn't available

## [0.1.2] - 2020-07-18

### Fixed

-   fixed a `load` event listener race condition on 2g & slow-2g connections

## [0.1.1] - 2020-07-03

### Fixed

-   service worker registration issues

## [0.1.0] - 2020-07-03

### ⚠️ Breaking Changes ⚠️

### Added

-   browser support detection [#78](https://github.com/Pageworks/djinnjs/issues/78)
    -   new `browser` export from `djinnjs/env`
    -   appends browser name as class to `<HTML>` element
-   `uid()` export to the `Env` class
-   `tickets` string array value to the Pjax `load` message type [#72](https://github.com/Pageworks/djinnjs/issues/72)
-   `pageJumpOffset` config variable, defaults to `null` [#42](https://github.com/Pageworks/djinnjs/issues/42)
-   `page-jump-offset` attribute allows developers to set dynamic offsets
-   `customPageJumpOffset` number value to the Pjax `load` message type
-   `reserveThread()` and `releaseThread()` functions to the `Env` class
-   public `threadPool` variable to the `Env` class -- tracks number of available threads
-   service worker rework [#55](https://github.com/Pageworks/djinnjs/issues/55)
-   `offline-first` service worker
-   `offline-backup` service worker
-   `resources-only` service worker
-   new `serviceWorker` config variable, now supports:
    -   `offline-first` _(default)_
    -   `offline-backup`
    -   `resources-only`
    -   `true` or `false`
    -   `null`
-   web component `required-connection` attribute support -- defaults to `4g`
-   new `removable` attribute -- removable web components will be removed when the user chooses to continue with the lightweight version of the site
-   replaced `eager-load-css` attribute with `eager-css` attribute
-   replaced `lazy-load-css` attribute with `lazy-css` attribute
-   dynamic Web Component polyfill
-   dynamic Intersection Observer polyfill

### Fixed

-   CSS & JS loading performance [#77](https://github.com/Pageworks/djinnjs/issues/77)
-   web component load/unload race conditions [#75](https://github.com/Pageworks/djinnjs/issues/75)
-   page jumps scroll the selected element into the center of the screen

### Removes

-   transition manager
-   transition config variables
-   support for custom transitions
-   transition documentation
-   removed `debug` export from the `Env` class
    -   all console logs are stipped when building for production
-   removed `uuid()` export from the `Env` class
    -   function was generating UIDs not UUIDs
-   `transition attribute` support
-   `transition-data attribute` support
-   support for multi-site configurations
-   `disableServiceWorker` config value -- use `serviceWorker` instead
-   `disablePrefetching` config value -- use `predictivePrefetching` instead
-   `disablePjax` config value -- use `pjax` instead
-   `eager-load-css` attribute -- use `eager-css` instead
-   `lazy-load-css` attribute -- use `lazy-css` instead

## [0.0.28] - 2020-05-14

### Added

-   strict file name checks [#67](https://github.com/Pageworks/djinnjs/issues/67)
-   `serviceWorker` config boolean
-   `predictivePrefetching` config boolean
-   `pjax` config boolean
-   developer documentation [#68](https://github.com/Pageworks/djinnjs/issues/68)

### Fixed

-   fixed `XMLHttpRequest` header bug

### Deprecated

-   `disableServiceWorker` config value
-   `disablePrefetching` config value
-   `disablePjax` config value

## [0.0.27] - 2020-05-04

### Fixed

-   broken `broadcaster-worker.min.js` fetch URL

## [0.0.26] - 2020-04-28

### ⚠️ Breaking Changes ⚠️

[WWIBS](https://github.com/Pageworks/wwibs) v0.1.2 introduced a breaking change where `message()` and `reply()` functions no longer accept several optional paramaters, instead they require an object:

**Message**

```typescript
type settings = {
    recipient: string;
    type: string;
    data?: {
        [key: string]: any;
    };
    senderId?: string;
    maxAttempts?: number;
};
```

**Reply**

```typescript
type settings = {
    replyId: string;
    type: string;
    data?: {
        [key: string]: any;
    };
    senderId?: string;
    maxAttempts?: number;
};
```

## [0.0.24] - 2020-04-09

### Added

-   ability to disable redirect following when pjaxing pages using the `followRedirects` config variable [#61](https://github.com/Pageworks/djinnjs/issues/61)

### Fixed

-   changed the service worker no-cache passthrough
-   PJAX script mounting bug [#63](https://github.com/Pageworks/djinnjs/issues/63)

## [0.0.23] - 2020-03-29

### ⚠️ Breaking Changes ⚠️

[WWIBS](https://github.com/Pageworks/wwibs) v0.0.9 introduced a breaking change where a new `senderId` string value can be provided allowing actors to reply/reply all. This value is provided after the `MessageData` object but before the `maxAttempts` number. Any `message()` that provided a `maxAttempts` value will need to be updated to appear as the following:

```javascript
message(
    "recipient",
    {
        type: "message",
    },
    null,
    Infinity
);
```

### Fixed

-   JavaScript scrubber bug where files could be injected twice
-   changed update notification

### Update

-   updated [wwibs](https://github.com/Pageworks/wwibs) to v0.0.9

## [0.0.22] - 2020-03-17

### Fixed

-   allows blacklisted fetch requests to follow redirects [#57](https://github.com/Pageworks/djinnjs/issues/57)

## [0.0.21] - 2020-02-06

### Fixed

-   incorrect file extensions for production builds
-   service worker is removed from the `outDir` when disabled

## [0.0.20] - 2020-02-04

### Fixed

-   service worker file extension issue
-   service workers `credentials: 'include'` value was prevented fetching scripts from CDNs due to CORS policy settings

## [0.0.17] - 2020-02-04

### ⚠️ Breaking Changes ⚠️

`fetch-js` and `fetch-css` files have been removed, switch to using the `fetch` file.

```javascript
import { fetchJS, fetchCSS } from "djinnjs/fetch";
```

DjinnJS no longer supports multisite configurations. Instead, create a new `package.json` for each site within a multisite project.

Files now use `.mjs` file extension. [Click here](https://v8.dev/features/modules#mjs) for information about using the `.mjs` extension. Update the runtime script `src` attribute to use the new `runtime.mjs` file. This change could require additional server configuration in order to server `.mjs` files with the `Content-Type: text/javascript` header.

The `broadcaster` object is no longer exported from `djinnjs/broadcaster` instead you must import the functions directly:

```javascript
import { hookup, disconnect, message } from "djinnjs/broadcaster";
```

### Added

-   switched to `.mjs` file extension [#49](https://github.com/Pageworks/djinnjs/issues/49)
-   [wwibs](https://github.com/Pageworks/wwibs) replaced integrated broadcaster

### Updated

-   `fetchJS()` util no longer strips file extension
    -   fetch will use a provided file extension
    -   fetch will append a `.mjs` file extention when one wasn't provided
    -   fetch still accepts a URL and does not modify the URL

### Removed

-   `fetchCSS()` from the `fetch-css` file, use `fetchCSS` from `djiinjs/fetch` instead
-   `fetchJS()` from the `fetch-js` file, use `fetchJS` from `djiinjs/fetch` instead
-   support for multisite config [#47](https://github.com/Pageworks/djinnjs/issues/47)

## [0.0.16] - 2020-01-30

### Added

-   Default transitions (None, Fade, Slide) use HTML attributes to controll transition settings [#16](https://github.com/Pageworks/djinnjs/issues/16)
-   Updated NPM packages

### Fixed

-   Windows filename regex issues [#28](https://github.com/Pageworks/djinnjs/issues/28)
-   broken `pjax-id` attribute selectors
-   Terser `minify()` method now reports the results error message instead of `null`

## [0.0.15] - 2020-01-15

### Fixed

-   Handles page scroll position on page load [#36](https://github.com/Pageworks/djinnjs/issues/36)
-   Scroll to element with id if hash is in url
-   Windows filename regex issues [#28](https://github.com/Pageworks/djinnjs/issues/28)
-   `fetchJS()` bug where `.js` was appended to external URLs [#35](https://github.com/Pageworks/djinnjs/issues/35)
-   script scrubber regex issue [#40](https://github.com/Pageworks/djinnjs/issues/40)
-   Updated Pjax page jump logic to use `id` attribute instead of the obsolete `name` attribute [#39](https://github.com/Pageworks/djinnjs/issues/39)

## [0.0.14] - 2020-01-13

### Fixed

-   Pjax verifies views exists before swapping [#30](https://github.com/Pageworks/djinnjs/issues/30)
-   Pjax uses `pjax-id` attribute to verify the developer intended for the `<main>` elements match
-   when `disableServiceWorker` is `true` Pjax no longer attempts to register any service worker scripts

## [0.0.13] - 2020-01-10

### Fixed

-   removed forgotten console log from CLI
-   CSS from the `src/` directory is relocated to the `dist/` directory

## [0.0.12] - 2020-01-10

### Added

-   [snowpack](https://www.npmjs.com/package/snowpack) npm package for bundling npm packages
-   `web_modules/` directory to `src/`
-   modified NotifyJS packge to `src/web_modules/`
-   custom `<pjax-notification>` snackbar notification stylesheet
-   Pjax fetches `pjax-notification` stylesheet during `init()`
-   Custom elements are prefixed with `djinnjs` [#20](https://github.com/Pageworks/djinnjs/issues/20)
    -   `file-loading-value` is now `djinnjs-file-loading-value`
    -   `file-loading-message` is now `djinnjs-file-loading-message`

### Updated

-   Updated [NotifyJS](https://www.npmjs.com/package/@codewithkyle/notifyjs) npm package to v1.0.3

### Fixed

-   Updated prettier style to force double quotes for faster parsing/optimization
-   Locked NotifyJS package to v1.0.3
-   regex patterns in CLI to handle new double quote string style
-   `src` array check
-   The scrubber and CSS util libs now synchronously resolve `src` paths when collecting files using [Glob](https://www.npmjs.com/package/glob)
-   Pjax loads inline scripts [#19](https://github.com/Pageworks/djinnjs/issues/19)
    -   Scripts with `src || id || pjax-script-id` attributes are removed and remounted every time the page loads
    -   Scripts with `innerHTML` are remounted every time the page loads
    -   Scripts with `src || id || pjax-script-id` attributes can prevent the remount using the `pjax-prevent-remount` attribute
-   Service Worker redirects [#17](https://github.com/Pageworks/djinnjs/issues/17)

### Removed

-   [rollup](https://www.npmjs.com/package/rollup) dev dependency
-   `notify.js` script from `core/`
-   `notify.js` script from the NPM package

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

[unreleased]: https://github.com/pageworks/djinnjs/compare/master...develop
[0.1.0]: https://github.com/pageworks/djinnjs/compare/v0.0.28...v0.1.0
[0.0.28]: https://github.com/pageworks/djinnjs/compare/v0.0.27...v0.0.28
[0.0.27]: https://github.com/pageworks/djinnjs/compare/v0.0.26...v0.0.27
[0.0.26]: https://github.com/pageworks/djinnjs/compare/v0.0.24...v0.0.26
[0.0.24]: https://github.com/pageworks/djinnjs/compare/v0.0.23...v0.0.24
[0.0.23]: https://github.com/pageworks/djinnjs/compare/v0.0.22...v0.0.23
[0.0.22]: https://github.com/pageworks/djinnjs/compare/v0.0.21...v0.0.22
[0.0.21]: https://github.com/pageworks/djinnjs/compare/v0.0.20...v0.0.21
[0.0.20]: https://github.com/pageworks/djinnjs/compare/v0.0.17...v0.0.20
[0.0.17]: https://github.com/pageworks/djinnjs/compare/v0.0.16...v0.0.17
[0.0.16]: https://github.com/pageworks/djinnjs/compare/v0.0.15...v0.0.16
[0.0.15]: https://github.com/pageworks/djinnjs/compare/v0.0.14...v0.0.15
[0.0.14]: https://github.com/pageworks/djinnjs/compare/v0.0.13...v0.0.14
[0.0.13]: https://github.com/pageworks/djinnjs/compare/v0.0.12...v0.0.13
[0.0.12]: https://github.com/pageworks/djinnjs/compare/v0.0.11...v0.0.12
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
