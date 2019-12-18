#!/usr/bin/env node

const updateNotifier = require('update-notifier');
const packageJson = require('../package.json');

const notifier = updateNotifier({
    pkg: packageJson,
    updateCheckInterval: 1000 * 60 * 60 * 24 * 30, // 1 month
});

if (notifier.update) {
    console.log(`Update available: ${notifier.update.latest}`);
}

const semver = require('semver');
const version = packageJson.engines.node;

if (!semver.satisfies(process.version, version)) {
    const rawVersion = version.replace(/[^\d\.]*/, '');
    console.log(`DjinnJS requires at least Node v${rawVersion} and you have v${process.version}`);
    process.exit(1);
}

const path = require('path');
const fs = require('fs');

const pkgPath = process.cwd();
const cfgPath = path.join(pkgPath, 'djinn.js');

if (!fs.existsSync(cfgPath)) {
    console.log('Missing djinn.js config file. Visit https://djinnjs.com/docs/getting-started for more information.');
    process.exit(1);
}

const config = require(cfgPath);
const rimraf = require('rimraf');

class DjinnJS {
    constructor(config) {
        this.config = config;
        this.main();
    }

    async main() {
        try {
            await this.preflightCheck();
            await this.createTempDirectory();
            await this.cleanup();
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
    }

    cleanup() {
        return new Promise(resolve => {
            rimraf.sync(path.join(__dirname, 'temp'));
            resolve();
        });
    }

    createTempDirectory() {
        return new Promise((resolve, reject) => {
            fs.mkdir(path.join(__dirname, 'temp'), error => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
        });
    }

    preflightCheck() {
        return new Promise(resolve => {
            if (fs.existsSync(path.join(__dirname, 'temp'))) {
                rimraf.sync(path.join(__dirname, 'temp'));
            }
            resolve();
        });
    }
}
new DjinnJS(config);
