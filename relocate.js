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
