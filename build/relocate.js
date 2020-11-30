const fs = require("fs");

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

fs.copyFile("./dist/core/component.js", "./component.js", error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile("./dist/core/component.d.ts", "./component.d.ts", error => {
    if (error) {
        console.log(error);
    }
});
