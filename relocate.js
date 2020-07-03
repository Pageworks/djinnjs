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

fs.copyFile("./dist/web_modules/broadcaster.js", "./broadcaster.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/web_modules/broadcaster.d.ts", "./broadcaster.d.ts", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./node_modules/wwibs/wwibs-worker.min.js", "./broadcaster-worker.min.js", error => {
    if (error) {
        console.log(error);
    }
});
