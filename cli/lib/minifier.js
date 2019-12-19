const glob = require('glob');
const mini = require('minify');
const fs = require('fs');
const path = require('path');

const cwd = process.cwd();

async function minify(handle, publicDir, outDir) {
    try {
        const files = await getFiles(handle);
        await minifyFiles(files, publicDir, outDir);
        return;
    } catch (error) {
        throw error;
    }
}

function minifyFiles(files, publicDir, relativeOutDir) {
    return new Promise((resolve, reject) => {
        let minified = 0;
        const outDir = path.resolve(cwd, publicDir, relativeOutDir);
        for (let i = 0; i < files.length; i++) {
            const filename = files[i].replace(/.*[\/\\]/g, '');
            mini(files[i])
                .then(data => {
                    fs.writeFile(`${outDir}/${filename}`, data, error => {
                        if (error) {
                            reject(error);
                        }
                        minified++;
                        if (minified === files.length) {
                            resolve();
                        }
                    });
                })
                .catch(error => {
                    reject(error);
                });
        }
    });
}

function getFiles(handle) {
    return new Promise((resolve, reject) => {
        const tempDir = path.resolve(__dirname, `../temp/${handle}`);
        glob(`${tempDir}/*.js`, (error, files) => {
            if (error) {
                reject(error);
            }
            resolve(files);
        });
    });
}
module.exports = minify;
