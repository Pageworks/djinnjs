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

if (fs.existsSync("./fetch.js")) {
    fs.unlinkSync("./fetch.js");
}
if (fs.existsSync("./fetch.d.ts")) {
    fs.unlinkSync("./fetch.d.ts");
}
