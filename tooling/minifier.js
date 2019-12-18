const glob = require('glob');
const mini = require('minify');
const fs = require('fs');
const path = require('path');

async function minify(handle, outDir) {
    try {
        const files = await getFiles(handle);
        await minifyFiles(files, outDir);
        return;
    } catch (error) {
        throw error;
    }
}

function minifyFiles(files, relativeOutDir) {
    return new Promise((resolve, reject) => {
        let minified = 0;
        const outDir = path.resolve(process.cwd(), relativeOutDir);
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
        const tempDir = path.join(__dirname, 'temp', handle);
        glob(`${tempDir}/*.js`, (error, files) => {
            if (error) {
                reject(error);
            }
            resolve(files);
        });
    });
}
module.exports = minify;
