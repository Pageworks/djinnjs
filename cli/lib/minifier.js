const glob = require('glob');
const mini = require('terser');
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
        if (files.length === 0) {
            resolve();
        }
        let minified = 0;
        const outDir = path.resolve(cwd, publicDir, relativeOutDir);
        for (let i = 0; i < files.length; i++) {
            const filename = files[i].replace(/.*[\/\\]/g, '');
            fs.readFile(files[i], (error, buffer) => {
                if (error) {
                    reject(error);
                }
                const result = mini.minify(buffer.toString(), {
                    compress: {
                        drop_console: true,
                        ecma: 6,
                        keep_infinity: true,
                        module: true,
                    },
                    mangle: {
                        module: true,
                    },
                });
                if (result.error) {
                    reject(error);
                }
                fs.writeFile(`${outDir}/${filename}`, result.code, error => {
                    if (error) {
                        reject(error);
                    }
                    minified++;
                    if (minified === files.length) {
                        resolve();
                    }
                });
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
