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

function relocate(files, publicDir, relativeOutDir) {
    return new Promise((resolve, reject) => {
        let relocated = 0;
        const outDir = path.resolve(cwd, publicDir, relativeOutDir);
        for (let i = 0; i < files.length; i++) {
            const filename = files[i].replace(/.*[\/\\]/g, '');
            fs.rename(files[i], `${outDir}/${filename}`, error => {
                if (error) {
                    reject(error);
                }
                relocated++;
                if (relocated === files.length) {
                    resolve();
                }
            });
        }
    });
}

async function move(sources, publicDir, outDir) {
    try {
        const files = await getFiles(sources);
        await relocate(files, publicDir, outDir);
        return;
    } catch (error) {
        throw error;
    }
}
module.exports = move;
