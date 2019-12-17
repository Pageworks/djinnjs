#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const pkgPath = process.cwd();
const cfgPath = path.join(pkgPath, 'djinn.js');

if (!fs.existsSync(cfgPath)) {
    console.log('Missing djinn.js config file.');
    process.exit(1);
}

const semver = require('semver');
const updateNotifier = require('update-notifier');
const packageJson = require(path.join(pkgPath, 'package.json'));

const notifier = updateNotifier({
    pkg: packageJson,
    updateCheckInterval: 1000 * 60 * 60 * 24 * 30, // 1 month
});

if (notifier.update) {
    console.log(`Update available: ${notifier.update.latest}`);
}

const version = packageJson.engines.node;

if (!semver.satisfies(process.version, version)) {
    const rawVersion = version.replace(/[^\d\.]*/, '');
    console.log(`DjinnJS requires at least Node v${rawVersion} and you have ${process.version}`);
    process.exit(1);
}
