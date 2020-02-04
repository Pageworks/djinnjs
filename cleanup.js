const fs = require("fs");
const rimraf = require("rimraf");

if (fs.existsSync("./dist")) {
    rimraf.sync("./dist");
}

if (fs.existsSync("./env.js")) {
    fs.unlinkSync("./env.js");
}
if (fs.existsSync("./env.d.ts")) {
    fs.unlinkSync("./env.d.ts");
}

if (fs.existsSync("./actor.js")) {
    fs.unlinkSync("./actor.js");
}
if (fs.existsSync("./actor.d.ts")) {
    fs.unlinkSync("./actor.d.ts");
}

if (fs.existsSync("./broadcaster.js")) {
    fs.unlinkSync("./broadcaster.js");
}
if (fs.existsSync("./broadcaster.d.ts")) {
    fs.unlinkSync("./broadcaster.d.ts");
}
if (fs.existsSync("./broadcaster-worker.min.js")) {
    fs.unlinkSync("./broadcaster-worker.min.js");
}

if (fs.existsSync("./fetch-css.js")) {
    fs.unlinkSync("./fetch-css.js");
}
if (fs.existsSync("./fetch-css.d.ts")) {
    fs.unlinkSync("./fetch-css.d.ts");
}

if (fs.existsSync("./fetch-js.js")) {
    fs.unlinkSync("./fetch-js.js");
}
if (fs.existsSync("./fetch-js.d.ts")) {
    fs.unlinkSync("./fetch-js.d.ts");
}

if (fs.existsSync("./fetch.js")) {
    fs.unlinkSync("./fetch.js");
}
if (fs.existsSync("./fetch.d.ts")) {
    fs.unlinkSync("./fetch.d.ts");
}

if (fs.existsSync("./notify.js")) {
    fs.unlinkSync("./notify.js");
}
if (fs.existsSync("./notify.d.ts")) {
    fs.unlinkSync("./notify.d.ts");
}
