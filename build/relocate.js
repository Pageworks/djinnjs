const fs = require("fs");

fs.copyFile("./dist/env.js", "./env.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/env.d.ts", "./env.d.ts", error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile("./dist/fetch.js", "./fetch.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/fetch.d.ts", "./fetch.d.ts", error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile("./dist/component.js", "./component.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/component.d.ts", "./component.d.ts", error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile("./dist/utilities.js", "./utilities.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/utilities.d.ts", "./utilities.d.ts", error => {
    if (error) {
        console.log(error);
    }
});