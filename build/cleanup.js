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

if (fs.existsSync("./fetch.js")) {
    fs.unlinkSync("./fetch.js");
}
if (fs.existsSync("./fetch.d.ts")) {
    fs.unlinkSync("./fetch.d.ts");
}

if (fs.existsSync("./component.js")) {
    fs.unlinkSync("./component.js");
}
if (fs.existsSync("./component.d.ts")) {
    fs.unlinkSync("./component.d.ts");
}

if (fs.existsSync("./utilities.js")) {
    fs.unlinkSync("./utilities.js");
}
if (fs.existsSync("./utilities.d.ts")) {
    fs.unlinkSync("./utilities.d.ts");
}