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
const scrub = require('./scrubber');
const minify = require('./minifier');
const moveCSS = require('./css');

class DjinnJS {
    constructor(config) {
        this.config = config;
        this.sites = [];
        this.main();
    }

    async main() {
        try {
            console.log('Running DjinnJS');
            await this.preflightCheck();
            await this.createTempDirectory();
            await this.parseAndValidateSites();
            await this.resetOutputDirectories();
            await this.createOutputDirectories();
            console.log('Scrubbing JavaScript imports');
            await this.scrubScripts();
            console.log('Minifying JavaScript');
            await this.minifyScript();
            console.log('Relocating CSS files');
            await this.relocateCSS();
            await this.cleanup();
        } catch (error) {
            console.log(error);
            console.log('Visit https://djinnjs.com/docs/getting-started for more information.');
            process.exit(1);
        }
    }

    relocateCSS() {
        return new Promise((resolve, reject) => {
            let sitesCompleted = 0;
            for (let i = 0; i < this.sites.length; i++) {
                const sources = this.sites[i].src instanceof Array ? this.sites[i].src : [this.sites[i].src];
                moveCSS(sources, this.sites[i].outDir)
                    .then(() => {
                        sitesCompleted++;
                        if (sitesCompleted === this.sites.length) {
                            resolve();
                        }
                    })
                    .catch(error => {
                        reject(error);
                    });
            }
        });
    }

    minifyScript() {
        return new Promise((resolve, reject) => {
            let sitesCompleted = 0;
            for (let i = 0; i < this.sites.length; i++) {
                const handle = this.sites[i].handle === undefined ? 'default' : this.sites[i].handle;
                minify(handle, this.sites[i].outDir)
                    .then(() => {
                        sitesCompleted++;
                        if (sitesCompleted === this.sites.length) {
                            resolve();
                        }
                    })
                    .catch(error => {
                        reject(error);
                    });
            }
        });
    }

    scrubScripts() {
        return new Promise((resolve, reject) => {
            let scrubbed = 0;
            for (let i = 0; i < this.sites.length; i++) {
                const sources = this.sites[i].src instanceof Array ? this.sites[i].src : [this.sites[i].src];
                const handle = this.sites[i].handle === undefined ? 'default' : this.sites[i].handle;
                scrub(sources, handle)
                    .then(() => {
                        scrubbed++;
                        if (scrubbed === this.sites.length) {
                            resolve();
                        }
                    })
                    .catch(error => {
                        reject(error);
                    });
            }
        });
    }

    createOutputDirectories() {
        return new Promise((resolve, reject) => {
            let created = 0;
            for (let i = 0; i < this.sites.length; i++) {
                const outDir = path.resolve(pkgPath, this.sites[i].outDir);
                if (!fs.existsSync(outDir)) {
                    fs.mkdir(outDir, error => {
                        if (error) {
                            reject(error);
                        }
                        resolve();
                    });
                } else {
                    created++;
                    if (created === this.sites.length) {
                        resolve();
                    }
                }
            }
        });
    }

    resetOutputDirectories() {
        return new Promise((resolve, reject) => {
            let purged = 0;
            for (let i = 0; i < this.sites.length; i++) {
                const outDir = path.resolve(pkgPath, this.sites[i].outDir);
                if (fs.existsSync(outDir)) {
                    rimraf(outDir, error => {
                        if (error) {
                            reject(error);
                        }
                        purged++;
                        if (purged === this.sites.length) {
                            resolve();
                        }
                    });
                } else {
                    purged++;
                    if (purged === this.sites.length) {
                        resolve();
                    }
                }
            }
        });
    }

    parseAndValidateSites() {
        return new Promise((resolve, reject) => {
            if (this.config.site instanceof Array) {
                this.sites = this.config.site;
            } else {
                this.sites = [this.config.site];
            }
            for (let i = 0; i < this.sites.length; i++) {
                if (this.sites[i].outDir === undefined) {
                    reject('Invalid DjinnJS site configuration. A site requires an output directory.');
                } else if (this.sites[i].src === undefined) {
                    reject('Invalid DjinnJS site configuration. A site requires a source directory.');
                } else if (this.sites.length > 1 && this.sites[i].handle === undefined) {
                    reject('Invalid DjinnJS site configuration. Sites require a handle when running DjinnJS in multisite mode.');
                }
            }
            resolve();
        });
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
