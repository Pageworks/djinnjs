const glob = require("glob");
const mini = require("terser");
const fs = require("fs");
const path = require("path");

const cwd = process.cwd();

const options = {
    ecma: 2019,
    compress: {
        drop_console: true,
        keep_infinity: true,
        module: true,
        dead_code: false,
        keep_fnames: true,
        unused: false,
        keep_classnames: true,
        collapse_vars: false,
        reduce_funcs: false,
        reduce_vars: false,
        unused: false,
    },
    mangle: false,
    keep_classnames: true,
    keep_fnames: true,
};

async function minify(publicDir, outDir) {
    try {
        const files = await getFiles();
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
            const filename = files[i].replace(/(.*[\/\\])|(\..*)$/g, "");
            fs.readFile(files[i], (error, buffer) => {
                if (error) {
                    reject(error);
                }
                const result = mini.minify(buffer.toString(), options);
                if (result.error) {
                    reject(`Terser Error: ${result.error.message} occured in ${filename}`);
                }
                fs.writeFile(`${outDir}/${filename}.mjs`, result.code, error => {
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

function getFiles() {
    return new Promise((resolve, reject) => {
        const tempDir = path.resolve(__dirname, `../temp`);
        glob(`${tempDir}/*.js`, (error, files) => {
            if (error) {
                reject(error);
            }
            resolve(files);
        });
    });
}
module.exports = minify;
