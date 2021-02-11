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
const glob = require("glob");

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
            await this.injectConfig();

            if (!this.silent) {
                spinner.text = "Minifying JavaScript";
            }
            await this.minifyScript();

            if (!this.silent) {
                spinner.text = "Relocating WebAssembly files";
            }
            await this.relocateWASM();

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

    async relocateWASM() {
        const distDir = path.resolve(__dirname, "../dist");
        const files = glob.sync(`${distDir}/**/*.wasm`);
        const outDir = path.resolve(cwd, this.config.publicDir, this.config.outDir);
        let relocated = 0;
        for (let i = 0; i < files.length; i++) {
            const filename = files[i].replace(/(.*[\/\\])/g, "");
            fs.copyFile(files[i], `${outDir}/${filename}`, error => {
                if (error) {
                    throw error;
                }
                relocated++;
                if (relocated === files.length) {
                    return;
                }
            });
        }
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
                minify(this.config.publicDir, this.config.outDir, this.config.terser)
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

    injectConfig() {
        return new Promise((resolve, reject) => {
            const configFile = path.join(__dirname, "temp", "config.js");
            fs.readFile(configFile, (error, buffer) => {
                if (error) {
                    reject(error);
                }
                let data = buffer.toString();
                data = data.replace("REPLACE_WITH_OUTPUT_DIR_NAME", this.config.outDir);
                data = data.replace("REPLACE_WITH_MINIMUM_CONNECTION", this.config.minimumConnection);
                fs.writeFile(configFile, data, error => {
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
            const tempPath = path.join(__dirname, "temp");
            if (fs.existsSync(tempPath)) {
                rimraf.sync(tempPath);
            }
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

    async preflightCheck() {
        await this.cleanup();
    }
}
new DjinnJS(customConfig);
