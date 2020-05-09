const glob = require("glob");
const fs = require("fs");
const path = require("path");

const cwd = process.cwd();

function getProjectFiles(sources) {
    return new Promise((resolve, reject) => {
        let searched = 0;
        let files = [];
        for (let i = 0; i < sources.length; i++) {
            const dirPath = path.resolve(process.cwd(), sources[i]);
            const newFiles = glob.sync(`${dirPath}/**/*.css`);
            files = [...files, ...newFiles];
            searched++;
            if (searched === sources.length) {
                resolve(files);
            }
        }
    });
}

function getCoreFiles() {
    return new Promise((resolve, reject) => {
        const distDir = path.resolve(__dirname, "../../dist");
        glob(`${distDir}/**/*.css`, (error, files) => {
            if (error) {
                reject(error);
            }
            resolve(files);
        });
    });
}

function relocate(files, publicDir, relativeOutDir) {
    return new Promise((resolve, reject) => {
        if (files.length === 0) {
            resolve();
        }
        let relocated = 0;
        const outDir = path.resolve(cwd, publicDir, relativeOutDir);
        for (let i = 0; i < files.length; i++) {
            const filename = files[i].replace(/.*[\/\\]/g, "");
            if (!fs.existsSync(`${outDir}/${filename}`)) {
                fs.copyFile(files[i], `${outDir}/${filename}`, error => {
                    if (error) {
                        reject(error);
                    }
                    relocated++;
                    if (relocated === files.length) {
                        resolve();
                    }
                });
            } else {
                reject(`Two files exist with the same name: ${filename}`);
                break;
            }
        }
    });
}

async function move(sources, publicDir, outDir) {
    try {
        const coreFiles = await getCoreFiles();
        const projectFiles = await getProjectFiles(sources);
        const files = [...coreFiles, ...projectFiles];
        await relocate(files, publicDir, outDir);
        return;
    } catch (error) {
        throw error;
    }
}
module.exports = move;
