const fs = require('fs');

fs.copyFile('./dist/core/env.js', './env.js', error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile('./dist/core/env.d.ts', './env.d.ts', error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile('./dist/core/actor.js', './actor.js', error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile('./dist/core/actor.d.ts', './actor.d.ts', error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile('./dist/core/broadcaster.js', './broadcaster.js', error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile('./dist/core/broadcaster.d.ts', './broadcaster.d.ts', error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile('./dist/core/fetch-css.js', './fetch-css.js', error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile('./dist/core/fetch-css.d.ts', './fetch-css.d.ts', error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile('./dist/core/fetch-js.js', './fetch-js.js', error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile('./dist/core/fetch-js.d.ts', './fetch-js.d.ts', error => {
    if (error) {
        console.log(error);
    }
});

fs.copyFile('./dist/packages/notify.js', './notify.js', error => {
    if (error) {
        console.log(error);
    }
});
fs.copyFile('./dist/packages/notify.d.ts', './notify.d.ts', error => {
    if (error) {
        console.log(error);
    }
});
