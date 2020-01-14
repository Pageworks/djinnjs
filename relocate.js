const fs = require("fs");
const path = require("path");
const glob = require("glob");

fs.copyFile("./dist/core/env.js", "./env.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/core/env.d.ts", "./env.d.ts", error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile("./dist/core/actor.js", "./actor.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/core/actor.d.ts", "./actor.d.ts", error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile("./dist/core/broadcaster.js", "./broadcaster.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/core/broadcaster.d.ts", "./broadcaster.d.ts", error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile("./dist/core/fetch-css.js", "./fetch-css.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/core/fetch-css.d.ts", "./fetch-css.d.ts", error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile("./dist/core/fetch-js.js", "./fetch-js.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/core/fetch-js.d.ts", "./fetch-js.d.ts", error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile("./dist/core/fetch.js", "./fetch.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/core/fetch.d.ts", "./fetch.d.ts", error => {
    if (error) {
        console.log(error);
    }
});

function moveCssToDist() {
    const pathToSrc = path.join(__dirname, "./src");
    const pathToDist = path.join(__dirname, "./dist");
    glob(`${pathToSrc}/**/*.css`, (error, srcFiles) => {
        if (error) {
            console.log(error);
            return;
        }

        if (!srcFiles.length) {
            return;
        }

        for (let i = 0; i < srcFiles.length; i++) {
            const filename = srcFiles[i].replace(/.*[\/\\]/, "");
            fs.copyFileSync(srcFiles[i], `${pathToDist}/${filename}`);
        }
    });
}
moveCssToDist();
