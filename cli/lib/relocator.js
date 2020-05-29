const glob = require("glob");
const fs = require("fs");
const path = require("path");

const cwd = process.cwd();

function copyFiles(files, publicDir, relativeOutDir) {
    return new Promise((resolve, reject) => {
        if (files.length === 0) {
            resolve();
        }
        let minified = 0;
        const outDir = path.resolve(cwd, publicDir, relativeOutDir);
        for (let i = 0; i < files.length; i++) {
            const filename = files[i].replace(/(.*[\/\\])|(\..*)$/g, "");
            fs.copyFile(files[i], `${outDir}/${filename}.mjs`, error => {
                if (error) {
                    reject(error);
                }
                minified++;
                if (minified === files.length) {
                    resolve();
                }
            });
        }
    });
}

function getFiles(filetype) {
    return new Promise((resolve, reject) => {
        const tempDir = path.resolve(__dirname, `../temp`);
        glob(`${tempDir}/*.${filetype}`, (error, files) => {
            if (error) {
                reject(error);
            }
            resolve(files);
        });
    });
}

async function relocator(publicDir, outDir, filetype) {
    try {
        const files = await getFiles(filetype);
        await copyFiles(files, publicDir, outDir);
        return;
    } catch (error) {
        throw error;
    }
}

module.exports = relocator;
