#!/usr/bin/env node

const updateNotifier = require("update-notifier");
const packageJson = require("../package.json");

const notifier = updateNotifier({
    pkg: packageJson,
    updateCheckInterval: 1000 * 60 * 60 * 24 * 30, // 1 month
});

if (notifier.update) {
    console.log(`\nDjinnJS ${notifier.update.latest} available.\n`);
}

const semver = require("semver");
const version = packageJson.engines.node;

if (!semver.satisfies(process.version, version)) {
    const rawVersion = version.replace(/[^\d\.]*/, "");
    console.log(`DjinnJS requires at least Node v${rawVersion} and you have ${process.version}`);
    process.exit(1);
}

const path = require("path");
const fs = require("fs");
const yargs = require("yargs").argv;

const cwd = process.cwd();

const configFilePath = yargs.c || yargs.config;
let verifiedConfigPath;
let customConfig = null;
if (configFilePath) {
    verifiedConfigPath = path.join(cwd, configFilePath);
    if (!fs.existsSync(verifiedConfigPath)) {
        console.log(`Missing the ${configFilePath} config file. Did you remove the file without removing the --config flag?`);
        process.exit(1);
    }
} else {
    verifiedConfigPath = path.join(cwd, "djinn.js");
    if (!fs.existsSync(verifiedConfigPath)) {
        verifiedConfigPath = path.join(cwd, "djinnjs.config.js");
        if (!fs.existsSync(verifiedConfigPath)) {
            verifiedConfigPath = null;
        }
    }
}

if (verifiedConfigPath) {
    customConfig = require(verifiedConfigPath);
}

const rimraf = require("rimraf");
const ora = require("ora");

const scrub = require("./lib/scrubber");
const minify = require("./lib/minifier");
const relocator = require("./lib/relocator");
const moveCSS = require("./lib/css");
const validateConfig = require("./lib/validate-config");
const noscript = require("./lib/noscript");

class DjinnJS {
    constructor(customConfig) {
        this.config = require("./lib/default-config");
        if (customConfig) {
            this.config = validateConfig(this.config, customConfig);
        }
        this.silent = this.config.silent;
        this.main();
    }

    async main() {
        const spinner = ora("DjinnJS").start();
        try {
            /** TODO: Add chalk */
            await this.preflightCheck();
            await this.createTempDirectory();
            await this.resetOutputDirectories();
            await this.createOutputDirectories();

            if (!this.silent) {
                spinner.text = "Scrubbing JavaScript imports";
            }
            await this.scrubScripts();
            await this.injectConfigScriptVariables();

            if (!this.silent) {
                spinner.text = "Minifying JavaScript";
            }
            await this.minifyScript();
            await this.relocateServiceWorker();
            await this.relocateBroadcastWorker();

            if (!this.silent) {
                spinner.text = "Relocating CSS files";
            }
            await this.relocateCSS();

            if (!this.silent) {
                spinner.text = "Generating noscript CSS file";
            }
            await this.generateNoScriptCSS();

            if (!this.silent) {
                spinner.text = "Cleaning up DjinnJS temporary files";
            }
            await this.cleanup();
            await this.cachebust();

            /** Exit the process when everything runs successfully */
            spinner.succeed("DjinnJS");
            process.exit(0);
        } catch (error) {
            spinner.fail("Visit https://djinnjs.com/configuration for help.");
            console.log(error);
            console.log("\n");
            process.exit(1);
        }
    }

    cachebust() {
        return new Promise((resolve, reject) => {
            const output = path.resolve(cwd, this.config.publicDir, "resources-cachebust.json");
            if (fs.existsSync(output)) {
                fs.unlinkSync(output);
            }

            const cachebustFile = path.join(__dirname, "resources-cachebust.json");
            fs.readFile(cachebustFile, (errror, buffer) => {
                if (errror) {
                    reject(errror);
                }
                let data = buffer.toString().replace("REPLACE_WITH_TIMESTAMP", `${Date.now()}`);
                fs.writeFile(output, data, errror => {
                    if (errror) {
                        reject(errror);
                    }
                    resolve();
                });
            });
        });
    }

    generateNoScriptCSS() {
        return new Promise((resolve, reject) => {
            noscript(this.config.src, this.config.publicDir, this.config.outDir)
                .then(() => {
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    relocateCSS() {
        return new Promise((resolve, reject) => {
            moveCSS(this.config.src, this.config.publicDir, this.config.outDir)
                .then(() => {
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    minifyScript() {
        return new Promise((resolve, reject) => {
            if (this.config.env === "production") {
                minify(this.config.publicDir, this.config.outDir)
                    .then(() => {
                        resolve();
                    })
                    .catch(error => {
                        reject(error);
                    });
            } else {
                relocator(this.config.publicDir, this.config.outDir, "js")
                    .then(() => {
                        resolve();
                    })
                    .catch(error => {
                        reject(error);
                    });
            }
        });
    }

    relocateBroadcastWorker() {
        return new Promise((resolve, reject) => {
            const publicPath = path.resolve(cwd, this.config.publicDir);
            fs.copyFile(path.resolve(__dirname, "../broadcaster-worker.min.js"), `${publicPath}/broadcaster-worker.min.js`, error => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
        });
    }

    relocateServiceWorker() {
        return new Promise((resolve, reject) => {
            const publicPath = path.resolve(cwd, this.config.publicDir);
            const assetPath = path.resolve(publicPath, this.config.outDir);
            if (this.config.serviceWorker) {
                fs.copyFileSync(`${assetPath}/${this.config.serviceWorker}.mjs`, `${publicPath}/service-worker.js`);

                fs.unlinkSync(`${assetPath}/offline-backup.mjs`);
                fs.unlinkSync(`${assetPath}/offline-first.mjs`);
                fs.unlinkSync(`${assetPath}/resources-only.mjs`);

                fs.readFile(`${publicPath}/service-worker.js`, (error, buffer) => {
                    if (error) {
                        reject(error);
                    }

                    let data = buffer.toString();
                    data = data.replace("REPLACE_WITH_NO_CACHE_PATTERN", this.config.noCachePattern);
                    data = data.replace("REPLACE_WITH_CACHEBUST_URL", this.config.cachebustURL);
                    data = data.replace("REPLACE_WITH_RESOURCE_PATTERN", this.config.resourcePattern);

                    fs.writeFile(`${publicPath}/service-worker.js`, data, error => {
                        if (error) {
                            reject(error);
                        }
                        resolve();
                    });
                });
            } else {
                fs.unlinkSync(`${assetPath}/offline-backup.mjs`);
                fs.unlinkSync(`${assetPath}/offline-first.mjs`);
                fs.unlinkSync(`${assetPath}/resources-only.mjs`);
                resolve();
            }
        });
    }

    injectConfigScriptVariables() {
        return new Promise((resolve, reject) => {
            const runtimeFile = path.join(__dirname, "temp", "config.js");
            fs.readFile(runtimeFile, (error, buffer) => {
                if (error) {
                    reject(error);
                }
                let data = buffer.toString();
                data = data.replace("REPLACE_WITH_OUTPUT_DIR_NAME", this.config.outDir);
                data = data.replace("REPLACE_WITH_GTAG_ID", this.config.gtagId);
                data = data.replace('"REPLACE_WITH_PJAX_STATUS"', this.config.pjax);
                data = data.replace('"REPLACE_WITH_PREFETCH_STATUS"', this.config.predictivePrefetching);
                data = data.replace('"REPLACE_WITH_FOLLOW_REDIRECT_STATUS"', this.config.followRedirects);
                data = data.replace('"REPLACE_WITH_USE_PERCENTAGE"', this.config.usePercentage);
                data = data.replace('"REPLACE_WITH_USE_SERVICE_WORKER"', `${this.config.serviceWorker ? true : false}`);
                data = data.replace('"REPLACE_WITH_PAGE_JUMP_OFFSET"', this.config.pageJumpOffset);
                fs.writeFile(runtimeFile, data, error => {
                    if (error) {
                        reject(error);
                    }
                    resolve();
                });
            });
        });
    }

    scrubScripts() {
        return new Promise((resolve, reject) => {
            scrub(this.config.src)
                .then(() => {
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    createOutputDirectories() {
        return new Promise((resolve, reject) => {
            const outDir = path.resolve(cwd, this.config.publicDir, this.config.outDir);
            if (!fs.existsSync(outDir)) {
                fs.mkdir(outDir, error => {
                    if (error) {
                        reject(error);
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    resetOutputDirectories() {
        return new Promise((resolve, reject) => {
            const outDir = path.resolve(cwd, this.config.publicDir, this.config.outDir);
            if (fs.existsSync(outDir)) {
                rimraf(outDir, error => {
                    if (error) {
                        reject(error);
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    cleanup() {
        return new Promise(resolve => {
            rimraf.sync(path.join(__dirname, "temp"));
            resolve();
        });
    }

    createTempDirectory() {
        return new Promise((resolve, reject) => {
            fs.mkdir(path.join(__dirname, "temp"), error => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
        });
    }

    preflightCheck() {
        return new Promise(resolve => {
            if (fs.existsSync(path.join(__dirname, "temp"))) {
                rimraf.sync(path.join(__dirname, "temp"));
            }
            resolve();
        });
    }
}
new DjinnJS(customConfig);
