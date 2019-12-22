# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
[0.0.2]: https://github.com/pageworks/djinnjs/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/pageworks/djinnjs/releases/tag/v0.0.1
