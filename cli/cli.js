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

/** TODO: Move config file logic into separate file */
const path = require('path');
const fs = require('fs');
const yargs = require('yargs').argv;

const cwd = process.cwd();
const configFile = yargs.c || yargs.config;

let cfgPath;
if (configFile) {
    cfgPath = path.join(cwd, configFile);
    if (!fs.existsSync(cfgPath)) {
        console.log(`Missing the ${configFile} config file. Did you remove the file without removing the --config flag?`);
        process.exit(1);
    }
} else {
    cfgPath = path.join(cwd, 'djinn.js');
    if (!fs.existsSync(cfgPath)) {
        cfgPath = path.join(cwd, 'djinnjs.config.js');
        if (!fs.existsSync(cfgPath)) {
            console.log('Missing djinn.js config file. Visit https://djinnjs.com/docs/getting-started for more information.');
            process.exit(1);
        }
    }
}

const config = require(cfgPath);

const rimraf = require('rimraf');
const ora = require('ora');

const scrub = require('./lib/scrubber');
const minify = require('./lib/minifier');
const relocator = require('./lib/relocator');
const moveCSS = require('./lib/css');
const configChecker = require('./lib/config-checker');
const noscript = require('./lib/noscript');

class DjinnJS {
    constructor(config) {
        this.config = config;
        this.sites = [];
        this.silent = config.silent === undefined ? true : config.silent;
        this.handle = null;
        this.main();
    }

    async main() {
        const spinner = ora('DjinnJS').start();
        try {
            /** TODO: Add chalk and spinner packages */
            await this.preflightCheck();
            await this.createTempDirectory();
            await this.validateSettings();
            await this.resetOutputDirectories();
            await this.createOutputDirectories();

            if (!this.silent) {
                spinner.text = 'Scrubbing JavaScript imports';
            }
            await this.scrubScripts();
            await this.injectConfigScriptVariables();
            await this.injectCachebustURL();

            if (!this.silent) {
                spinner.text = 'Minifying JavaScript';
            }
            await this.minifyScript();
            await this.relocateServiceWorker();

            if (!this.silent) {
                spinner.text = 'Relocating CSS files';
            }
            await this.relocateCSS();

            if (!this.silent) {
                spinner.text = 'Generating noscript CSS file';
            }
            await this.generateNoScriptCSS();

            if (!this.silent) {
                spinner.text = 'Cleaning up DjinnJS temporary files';
            }
            await this.cleanup();
            await this.cachebust();

            /** Exit the process when everything runs successfully */
            spinner.succeed('DjinnJS');
            process.exit(0);
        } catch (error) {
            spinner.fail(error, 'Visit https://djinnjs.com/docs for help.');
            process.exit(1);
        }
    }

    cachebust() {
        return new Promise((resolve, reject) => {
            let sitesBusted = 0;
            for (let i = 0; i < this.sites.length; i++) {
                const output = path.resolve(cwd, this.sites[i].publicDir, 'resources-cachebust.json');
                if (fs.existsSync(output)) {
                    fs.unlinkSync(output);
                }

                if (!this.sites[i].disableServiceWorker) {
                    const cachebustFile = path.join(__dirname, 'resources-cachebust.json');
                    fs.readFile(cachebustFile, (errror, buffer) => {
                        if (errror) {
                            reject(errror);
                        }
                        let data = buffer.toString().replace('REPLACE_WITH_TIMESTAMP', `${Date.now()}`);
                        fs.writeFile(output, data, errror => {
                            if (errror) {
                                reject(errror);
                            }
                            sitesBusted++;
                            if (sitesBusted === this.sites.length) {
                                resolve();
                            }
                        });
                    });
                } else {
                    sitesBusted++;
                    if (sitesBusted === this.sites.length) {
                        resolve();
                    }
                }
            }
        });
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
                if (this.sites[i].env === 'production') {
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
                } else {
                    relocator(handle, this.sites[i].publicDir, this.sites[i].outDir, 'js')
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

    injectCachebustURL() {
        return new Promise((resolve, reject) => {
            let completed = 0;
            for (let i = 0; i < this.sites.length; i++) {
                const handle = this.sites[i].handle === undefined ? 'default' : this.sites[i].handle;
                const serviceWorker = path.join(__dirname, 'temp', handle, 'service-worker.js');
                fs.readFile(serviceWorker, (error, buffer) => {
                    if (error) {
                        reject(error);
                    }
                    let data = buffer.toString();
                    data = data.replace('REPLACE_WITH_CACHEBUST_URL', this.config.cachebustURL);
                    fs.writeFile(serviceWorker, data, error => {
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

    injectConfigScriptVariables() {
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
                    data = data.replace('REPLACE_WITH_ENVIRONMENT', this.sites[i].env);
                    data = data.replace('REPLACE_WITH_GTAG_ID', this.sites[i].gtagId);
                    data = data.replace('REPLACE_WITH_DEFAULT_TRANSITION', this.sites[i].defaultTransition);
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

    validateSettings() {
        return new Promise((resolve, reject) => {
            if (this.config.noCachePattern === undefined) {
                this.config.noCachePattern = /(\.json)$||(cachebust\.js)/gi;
            } else if (!this.config.noCachePattern instanceof RegExp) {
                reject(`Invalid DjinnJS configuration. The noCachePattern value must be a regular expression pattern.`);
            }

            if (this.config.cachebustURL === undefined) {
                this.config.cachebustURL = '/cachebust.json';
            } else if (!this.config.cachebustURL instanceof String) {
                reject(`Invalid DjinnJS configuration. The cachebustURL value must be a string.`);
            }

            if (this.config.sites !== undefined) {
                this.handle = yargs.h || yargs.handle || null;
            }

            if (this.config.sites instanceof Array) {
                this.sites = this.config.sites;

                if (this.handle) {
                    const singleSite = [];
                    for (let i = 0; i < this.sites.length; i++) {
                        if (this.sites[i].handle !== undefined && this.sites[i].handle === this.handle) {
                            singleSite.push(this.sites[i]);
                            break;
                        }
                    }
                    if (singleSite.length) {
                        this.sites = singleSite;
                    } else {
                        reject(`Invalid DjinnJS configuration. The handle flag value of ${this.handle} did not match any of the sites handles.`);
                    }
                }

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
                    env: this.config.env,
                    gtagId: this.config.gtagId,
                    defaultTransition: this.config.defaultTransition,
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
