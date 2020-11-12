const glob = require("glob");
const fs = require("fs");
const path = require("path");

async function scrubber(sources) {
    try {
        const projectFiles = await getProjectFiles(sources);
        const coreFiles = await getCoreFiles();
        const tempFiles = await getTempFiles();
        const files = [...projectFiles, ...coreFiles, ...tempFiles];
        await scrubFiles(files);
        return;
    } catch (error) {
        throw error;
    }
}

function scrubFiles(files) {
    return new Promise((resolve, reject) => {
        if (files.length === 0) {
            resolve();
        }
        let scrubbed = 0;
        const outDir = path.resolve(__dirname, `../temp`);
        for (let i = 0; i < files.length; i++) {
            const filePath = files[i];
            const filename = filePath.replace(/.*[\/\\]/g, "");
            if (!fs.existsSync(`${outDir}/${filename}`)) {
                fs.readFile(filePath, (error, buffer) => {
                    if (error) {
                        reject(error);
                    }

                    let data = buffer.toString();

                    /** Grab everything between the string values for the import statement */
                    let importFilePaths = data.match(/(?<=from\s+[\'\"]).*(?=[\'\"]\;)/g);

                    if (importFilePaths) {
                        importFilePaths.map(path => {
                            if (new RegExp(/^(http[s]\:\/\/)/).test(path) === false){
                                /** Remove everything in the path except the file name */
                                let pathFileName = path.replace(/.*[\/\\]/g, "").replace(/(\.ts)|(\.js)$/g, "");
                                data = data.replace(`"${path}"`, `"./${pathFileName}.mjs"`).replace(`'${path}'`, `"./${pathFileName}.mjs"`);
                            }
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
            } else {
                reject(`Two files exist with the same name: ${filename}`);
                break;
            }
        }
    });
}

function getTempFiles() {
    return new Promise((resolve, reject) => {
        const distDir = path.resolve(__dirname, "../injections");
        glob(`${distDir}/*.js`, (error, files) => {
            if (error) {
                reject(error);
            }
            resolve(files);
        });
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
