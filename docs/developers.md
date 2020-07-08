## Folders

```bash
├── src             # DjinnJS framework source code
├── cli             # CLI and compiler source code
└── package.json
```

## Setup

Fork and clone [DjinnJS](https://github.com/Pageworks/djinnjs).

Install the dependencies:

```bash
npm ci
```

Setup an [NPM link](https://docs.npmjs.com/cli/link.html):

```bash
npm link
```

Link the local version of DjinnJS as a dependency for the sample project:

```bash
npm link djinnjs
```

## Making Changes

Make changes to DjinnJS and run the compile command:

```bash
npm run compile
```

In the sample project run the build command:

```bash
djinnjs
```

## Documenting Chagnes

In `changelog.md` add your changes below the **Unreleased** heading using the following subheadings:

```bash
### Added
### Fixed
### Removed
### Deprecated
```

## Preparing Your Commit

Run the following command to lint your code:

```bash
npm run prerelease
```

Pull Requests that fail linting will be rejected.

## Committing Changes

Close your issue(s) via your commit message:

```bash
git commit -m "Closes #1 - added brief commit message example"
```

[Click here](https://help.github.com/en/github/managing-your-work-on-github/closing-issues-using-keywords) for additional information about closing issues using keywords.

## Creating Pull Requests

See [Branch Organization](/contributing#branch-organization) for details.
