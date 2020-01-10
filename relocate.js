const fs = require("fs");

fs.copyFile("./dist/src/core/env.js", "./env.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/src/core/env.d.ts", "./env.d.ts", error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile("./dist/src/core/actor.js", "./actor.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/src/core/actor.d.ts", "./actor.d.ts", error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile("./dist/src/core/broadcaster.js", "./broadcaster.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/src/core/broadcaster.d.ts", "./broadcaster.d.ts", error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile("./dist/src/core/fetch-css.js", "./fetch-css.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/src/core/fetch-css.d.ts", "./fetch-css.d.ts", error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile("./dist/src/core/fetch-js.js", "./fetch-js.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/src/core/fetch-js.d.ts", "./fetch-js.d.ts", error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile("./dist/src/core/fetch.js", "./fetch.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/src/core/fetch.d.ts", "./fetch.d.ts", error => {
    if (error) {
        console.log(error);
    }
});
