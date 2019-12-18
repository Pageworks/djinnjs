const glob = require('glob');
const fs = require('fs');
const path = require('path');

module.exports = class ScriptScrubber {
    constructor() {
        this.sources = [];
        this.outDir = './temp';
    }

    async scrub(sources, outDir) {
        try {
            this.outDir = outDir;
            this.sources = sources;
            const projectFiles = await this.getProjectFiles();
            const coreFiles = await this.getCoreFiles();
            await this.createTempDirectory();
            const files = [...projectFiles, ...coreFiles];
            await this.scrubFiles(files);
            return;
        } catch (error) {
            throw error;
        }
    }

    scrubFiles(files) {
        return new Promise((resolve, reject) => {
            let scrubbed = 0;
            for (let i = 0; i < files.length; i++) {
                const filePath = files[i];
                const filename = filePath.replace(/.*[\/\\]/g, '');
                fs.readFile(filePath, (error, buffer) => {
                    if (error) {
                        reject(error);
                    }

                    let data = buffer.toString();

                    /** Grab everything between the string values for the import statement */
                    let importFilePaths = data.match(/(?<=from\s+[\'\"]).*(?=[\'\"]\;)/g);

                    if (importFilePaths) {
                        importFilePaths.map(path => {
                            /** Remove everything in the path except the file name */
                            let pathFileName = path.replace(/.*[\/\\]/g, '').replace(/(\.ts)|(\.js)$/g, '');
                            data = data.replace(`${path}`, `./${pathFileName}.js`);
                        });
                    }

                    fs.writeFile(`${this.outDir}/${filename}`, data, error => {
                        if (error) {
                            reject(error);
                        }

                        scrubbed++;
                        if (scrubbed === files.length) {
                            resolve();
                        }
                    });
                });
            }
        });
    }

    createTempDirectory() {
        return new Promise((resolve, reject) => {
            const dir = path.join(__dirname, 'temp', this.outDir);
            this.outDir = dir;
            if (!fs.existsSync(dir)) {
                fs.mkdir(dir, error => {
                    if (error) {
                        reject(error);
                    }
                    resolve();
                });
            }
        });
    }

    getCoreFiles() {
        return new Promise((resolve, reject) => {
            const distDir = path.resolve(__dirname, '../dist');
            glob(`${distDir}/**/*.js`, (error, files) => {
                if (error) {
                    reject(error);
                }
                resolve(files);
            });
        });
    }

    getProjectFiles() {
        return new Promise((resolve, reject) => {
            let searched = 0;
            let files = [];
            for (let i = 0; i < this.sources.length; i++) {
                const dirPath = path.resolve(process.cwd(), this.sources[i]);
                glob(`${dirPath}/**/*.js`, (error, newFiles) => {
                    if (error) {
                        reject(error);
                    }
                    files = [...newFiles];
                    searched++;
                    if (searched === this.sources.length) {
                        resolve(files);
                    }
                });
            }
        });
    }
};
