const yargs = require("yargs").argv;

function checkSite(site, multisite = false) {
    return new Promise((resolve, reject) => {
        if (multisite) {
            if (site.handle === undefined) {
                reject(`Invalid DjinnJS configuration. Sites require a handle when running DjinnJS in multisite mode.`);
            } else if (typeof site.handle !== "string") {
                reject(`Invalid DjinnJS configuration. The handle value must be a string.`);
            }
        }

        if (site.src === undefined) {
            site.src = "./src";
        } else if (typeof site.src !== "string" && !Array.isArray(site.src)) {
            reject(`Invalid DjinnJS configuration. The src value must be a string or an array of strings.`);
        }

        if (site.publicDir === undefined) {
            site.publicDir = "./public";
        } else if (typeof site.publicDir !== "string") {
            reject(`Invalid DjinnJS configuration. The publicDir value must be a string.`);
        } else {
            site.publicDir = site.publicDir.trim();
        }

        if (site.outDir === undefined) {
            site.outDir = "assets";
        } else if (typeof site.outDir !== "string") {
            reject(`Invalid DjinnJS configuration. The outDir value must be a string.`);
        } else {
            site.outDir = site.outDir.toLowerCase().trim();
        }

        // TODO: Remove
        if (site.disableServiceWorker === undefined) {
            site.disableServiceWorker = false;
        } else if (typeof site.disableServiceWorker !== "boolean") {
            reject(`Invalid DjinnJS configuration. The disableServiceWorker value must be a boolean.`);
        } else {
            console.warn("\ndisableServiceWorker value has been deprecated use serviceWorker instead\n");
            site.serviceWorker = site.disableServiceWorker ? false : true;
        }

        if (site.serviceWorker === undefined) {
            site.serviceWorker = "offline-first";
        } else if (site.serviceWorker === null) {
            site.serviceWorker = false;
        } else if (typeof site.serviceWorker === "boolean") {
            if (site.serviceWorker) {
                site.serviceWorker = "offline-first";
            } else {
                site.serviceWorker = false;
            }
        } else if (typeof site.serviceWorker === "string") {
            switch (site.serviceWorker) {
                case "offline-first":
                    site.serviceWorker = "offline-first";
                    break;
                case "offline-backup":
                    site.serviceWorker = "offline-backup";
                    break;
                case "resources-only":
                    site.serviceWorker = "resources-only";
                    break;
                default:
                    site.serviceWorker = "offline-first";
                    break;
            }
        } else {
            reject(`Invalid DjinnJS configuration. The serviceWorker value must be a boolean, null, or a string: 'offline-first', 'offline-backup', 'resources-only'`);
        }

        if (site.gtagId === undefined) {
            site.gtagId = "";
        } else if (typeof site.gtagId !== "string") {
            reject(`Invalid DjinnJS configuration. The gtagId value must be a string.`);
        }

        if (site.disablePjax === undefined) {
            site.disablePjax = false;
        } else if (typeof site.disablePjax !== "boolean") {
            reject(`Invalid DjinnJS configuration. The disablePjax value must be a boolean.`);
        } else {
            console.warn("disablePjax value has been deprecated use pjax instead");
            site.pjax = site.disablePjax ? false : true;
        }

        if (site.pjax === undefined) {
            site.pjax = true;
        } else if (typeof site.pjax !== "boolean") {
            reject(`Invalid DjinnJS configuration. The pjax value must be a boolean.`);
        }

        if (site.followRedirects === undefined) {
            site.followRedirects = true;
        } else if (typeof site.followRedirects !== "boolean") {
            reject(`Invalid DjinnJS configuration. The followRedirects value must be a boolean.`);
        }

        // TODO: Remove
        if (site.disablePrefetching === undefined) {
            site.disablePrefetching = false;
        } else if (typeof site.disablePrefetching !== "boolean") {
            reject(`Invalid DjinnJS configuration. The disablePrefetching value must be a boolean.`);
        } else {
            console.warn("disablePrefetching value has been deprecated use prefetch instead");
            site.predictivePrefetching = site.disablePrefetching ? false : true;
        }

        if (site.predictivePrefetching === undefined) {
            site.predictivePrefetching = true;
        } else if (typeof site.predictivePrefetching !== "boolean") {
            reject(`Invalid DjinnJS configuration. The prefetch value must be a boolean.`);
        }

        if (site.usePercentage === undefined) {
            site.usePercentage = false;
        } else if (typeof site.usePercentage !== "boolean") {
            reject(`Invalid DjinnJS configuration. The usePercentage value must be a boolean.`);
        }

        if (site.pageJumpOffset === undefined) {
            site.pageJumpOffset = null;
        } else if (typeof site.pageJumpOffset !== "number") {
            reject(`Invalid DjinnJS configuration. The pageJumpOffset value must be a number.`);
        }

        let env = site.env || yargs.e || yargs.env;
        if (!env) {
            env = "production";
        }
        if (typeof env !== "string") {
            reject(`Invalid DjinnJS configuration. The env value must be a string.`);
        }
        site.env = env.toLowerCase().trim();
        resolve(site);
    });
}
module.exports = checkSite;
