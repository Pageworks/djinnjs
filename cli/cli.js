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

const cwd = process.cwd();
const cfgPath = path.join(cwd, 'djinn.js');

if (!fs.existsSync(cfgPath)) {
    console.log('Missing djinn.js config file. Visit https://djinnjs.com/docs/getting-started for more information.');
    process.exit(1);
}

const config = require(cfgPath);
const rimraf = require('rimraf');
const scrub = require('./lib/scrubber');
const minify = require('./lib/minifier');
const moveCSS = require('./lib/css');
const configChecker = require('./lib/config-checker');
const noscript = require('./lib/noscript');

class DjinnJS {
    constructor(config) {
        this.config = config;
        this.sites = [];
        this.debug = config.debug === undefined ? false : config.debug;
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
            if (this.debug) {
                console.log('Scrubbing JavaScript imports');
            }
            await this.scrubScripts();
            await this.injectOutputDir();
            if (this.debug) {
                console.log('Minifying JavaScript');
            }
            await this.minifyScript();
            await this.relocateServiceWorker();
            if (this.debug) {
                console.log('Relocating CSS files');
            }
            await this.relocateCSS();
            if (this.debug) {
                console.log('Generating noscript CSS file');
            }
            await this.generateNoScriptCSS();
            if (this.debug) {
                console.log('Cleaning up DjinnJS temporary files');
            }
            await this.cleanup();
        } catch (error) {
            console.log(error);
            console.log('Visit https://djinnjs.com/docs for more information.');
            process.exit(1);
        }
    }

    generateNoScriptCSS() {
        return new Promise((resolve, reject) => {
            let sitesCompleted = 0;
            for (let i = 0; i < this.sites.length; i++) {
                const sources = this.sites[i].src instanceof Array ? this.sites[i].src : [this.sites[i].src];
                noscript(sources, this.sites[i].publicDir, this.sites[i].outDir)
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

    relocateCSS() {
        return new Promise((resolve, reject) => {
            let sitesCompleted = 0;
            for (let i = 0; i < this.sites.length; i++) {
                const sources = this.sites[i].src instanceof Array ? this.sites[i].src : [this.sites[i].src];
                moveCSS(sources, this.sites[i].publicDir, this.sites[i].outDir)
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
                minify(handle, this.sites[i].publicDir, this.sites[i].outDir)
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

    relocateServiceWorker() {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < this.sites.length; i++) {
                const publicPath = path.resolve(cwd, this.sites[i].publicDir);
                const assetPath = path.resolve(publicPath, this.sites[i].outDir);
                if (this.sites[i].disableServiceWorker) {
                    fs.unlink(`${assetPath}/service-worker.js`, error => {
                        if (error) {
                            reject(error);
                        }
                        resolve();
                    });
                } else {
                    fs.rename(`${assetPath}/service-worker.js`, `${publicPath}/service-worker.js`, error => {
                        if (error) {
                            reject(error);
                        }
                        fs.readFile(`${publicPath}/service-worker.js`, (error, buffer) => {
                            if (error) {
                                reject(error);
                            }
                            let data = buffer.toString().replace('REPLACE_WITH_NO_CACHE_PATTERN', this.config.noCachePattern);
                            fs.writeFile(`${publicPath}/service-worker.js`, data, error => {
                                if (error) {
                                    reject(error);
                                }
                                resolve();
                            });
                        });
                    });
                }
            }
        });
    }

    injectOutputDir() {
        return new Promise((resolve, reject) => {
            let completed = 0;
            for (let i = 0; i < this.sites.length; i++) {
                const handle = this.sites[i].handle === undefined ? 'default' : this.sites[i].handle;
                const runtimeFile = path.join(__dirname, 'temp', handle, 'config.js');
                fs.readFile(runtimeFile, (error, buffer) => {
                    if (error) {
                        reject(error);
                    }
                    let data = buffer.toString();
                    data = data.replace('REPLACE_WITH_OUTPUT_DIR_NAME', this.sites[i].outDir);
                    fs.writeFile(runtimeFile, data, error => {
                        if (error) {
                            reject(error);
                        }
                        completed++;
                        if (completed === this.sites.length) {
                            resolve();
                        }
                    });
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
                const outDir = path.resolve(cwd, this.sites[i].publicDir, this.sites[i].outDir);
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
                const outDir = path.resolve(cwd, this.sites[i].publicDir, this.sites[i].outDir);
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
            if (this.config.noCachePattern === undefined) {
                this.config.noCachePattern = /(\.json)$||(cachebust\.js)/gi;
            } else if (!this.config.noCachePattern instanceof RegExp) {
                reject(`Invalid DjinnJS configuration. The noCachePattern value must be a regular expression pattern.`);
            }

            if (this.config.site instanceof Array) {
                this.sites = this.config.sites;
                let validated = 0;
                for (let i = 0; i < this.sites.length; i++) {
                    configChecker(this.sites[i], true)
                        .then(site => {
                            this.sites[i] = site;
                            validated++;
                            if (validated === this.sites.length) {
                                resolve();
                            }
                        })
                        .catch(error => {
                            reject(error);
                        });
                }
            } else {
                const site = {
                    src: this.config.src,
                    publicDir: this.config.publicDir,
                    outDir: this.config.outDir,
                    disableServiceWorker: this.config.disableServiceWorker,
                };
                configChecker(site)
                    .then(validSite => {
                        this.sites = [validSite];
                        resolve();
                    })
                    .catch(error => {
                        reject(error);
                    });
            }
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
