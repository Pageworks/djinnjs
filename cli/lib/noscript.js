const glob = require('glob');
const fs = require('fs');
const path = require('path');

const cwd = process.cwd();

function getFiles(sources) {
    return new Promise((resolve, reject) => {
        let searched = 0;
        let files = [];
        for (let i = 0; i < sources.length; i++) {
            const dirPath = path.resolve(cwd, sources[i]);
            glob(`${dirPath}/**/*.css`, (error, newFiles) => {
                if (error) {
                    reject(error);
                }
                files = [...files, ...newFiles];
                searched++;
                if (searched === sources.length) {
                    resolve(files);
                }
            });
        }
    });
}

function merge(files, publicDir, relativeOutDir) {
    return new Promise((resolve, reject) => {
        if (files.length === 0) {
            resolve();
        }
        let merged = 0;
        let data = '';
        const outDir = path.resolve(cwd, publicDir, relativeOutDir);
        for (let i = 0; i < files.length; i++) {
            fs.readFile(files[i], (error, buffer) => {
                if (error) {
                    reject(error);
                }
                data += buffer.toString();
                merged++;
                if (merged === files.length) {
                    fs.writeFile(`${outDir}/noscript.css`, data, error => {
                        if (error) {
                            reject(error);
                        }
                        resolve();
                    });
                }
            });
        }
    });
}

async function noscript(sources, publicDir, outDir) {
    try {
        const files = await getFiles(sources);
        await merge(files, publicDir, outDir);
        return;
    } catch (error) {
        throw error;
    }
}

module.exports = noscript;
