const glob = require("glob");
const fs = require("fs");
const path = require("path");

async function scrubber(sources, outDir) {
    try {
        const projectFiles = await getProjectFiles(sources);
        const coreFiles = await getCoreFiles();
        await createTempDirectory(outDir);
        const files = [...projectFiles, ...coreFiles];
        await scrubFiles(files, outDir);
        return;
    } catch (error) {
        throw error;
    }
}

function scrubFiles(files, handle) {
    return new Promise((resolve, reject) => {
        if (files.length === 0) {
            resolve();
        }
        let scrubbed = 0;
        const outDir = path.resolve(__dirname, `../temp/${handle}`);
        for (let i = 0; i < files.length; i++) {
            const filePath = files[i];
            const filename = filePath.replace(/.*[\/\\]/g, "");
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
                        let pathFileName = path.replace(/.*[\/\\]/g, "").replace(/(\.ts)|(\.js)$/g, "");
                        data = data.replace(`"${path}"`, `"./${pathFileName}.js"`).replace(`'${path}'`, `"./${pathFileName}.js"`);
                    });
                }

                fs.writeFile(`${outDir}/${filename}`, data, error => {
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

function createTempDirectory(outDir) {
    return new Promise((resolve, reject) => {
        const dir = path.resolve(__dirname, `../temp/${outDir}`);
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

function getCoreFiles() {
    return new Promise((resolve, reject) => {
        const distDir = path.resolve(__dirname, "../../dist");
        glob(`${distDir}/**/*.js`, (error, files) => {
            if (error) {
                reject(error);
            }
            resolve(files);
        });
    });
}

function getProjectFiles(sources) {
    return new Promise((resolve, reject) => {
        let searched = 0;
        let files = [];
        for (let i = 0; i < sources.length; i++) {
            const dirPath = path.resolve(process.cwd(), sources[i]);
            const newFiles = glob.sync(`${dirPath}/**/*.js`);
            files = [...files, ...newFiles];
            searched++;
            if (searched === sources.length) {
                resolve(files);
            }
        }
    });
}

module.exports = scrubber;
