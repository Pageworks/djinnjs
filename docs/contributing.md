# Contributing

The following is a set of guidelines for contributing to DjinnJS. Please spend several minutes reading these guidelines before you create an issue or pull request.

## Code of Conduct

We have adopted a [Code of Conduct](/code-of-conduct) that we expect project participants to adhere to. Please read the full text so that you can understand what actions will and will not be tolerated.

## Open Development

All work happens directly on [GitHub](https://github.com/Pageworks/djinnjs). Both core team members and external contributors send pull requests which go through the same review process.

## Branch Organization

We maintain two branches, `master` and `develop`. If you send a bugfix pull request, please do it against the `master` branch, if it's a feature pull request, please do it against the `develop` branch.

## Bugs

We are using [GitHub Issues](https://github.com/Pageworks/djinnjs/pulls) for bug tracking. The best way to get your bug fixed to provide reproduction steps.

Before you report a bug, please make sure you've searched existing issues.

## Your First Pull Request

Working on your first Pull Request? You can learn how from this free video series:

[How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)

If you decide to fix an issue, please be sure to check the comment thread in case somebody is already working on a fix. If nobody is working on it at the moment, please leave a comment stating that you intend to work on it so other people don't accidentally duplicate your effort.

If somebody claims an issue but doesn't follow up for more than two weeks, it's fine to take over it but you should still leave a comment.

## Sending a Pull Request

The core team is monitoring for pull requests. We will review your pull request and either merge it, request changes to it, or close it with an explanation.

Before submitting a pull request, please make sure the following is done:

1. Fork the repository and create your branch from the correct branch.
1. Run `npm ci` in the repository root.
1. Make sure your code lints (`npm run prerelease`). Lint runs automatically when you git commit.
1. Send a Pull Request

## Development Workflow

Read the [Developer Guide](/developers).