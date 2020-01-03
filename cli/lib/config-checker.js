const yargs = require('yargs').argv;

function checkSite(site, multisite = false) {
    return new Promise((resolve, reject) => {
        if (multisite) {
            if (site.handle === undefined) {
                reject(`Invalid DjinnJS configuration. Sites require a handle when running DjinnJS in multisite mode.`);
            } else if (!site.handle instanceof String) {
                reject(`Invalid DjinnJS configuration. The handle value must be a string.`);
            }
        }

        if (site.src === undefined) {
            site.src = './src';
        } else if (!site.src instanceof String && !site.src instanceof Array) {
            reject(`Invalid DjinnJS configuration. The src value must be a string or an array of strings.`);
        }

        if (site.publicDir === undefined) {
            site.publicDir = './public';
        } else if (!site.publicDir instanceof String) {
            reject(`Invalid DjinnJS configuration. The publicDir value must be a string.`);
        } else {
            site.publicDir = site.publicDir.trim();
        }

        if (site.outDir === undefined) {
            site.outDir = 'assets';
        } else if (!site.outDir instanceof String) {
            reject(`Invalid DjinnJS configuration. The outDir value must be a string.`);
        } else {
            site.outDir = site.outDir.toLowerCase().trim();
        }

        if (site.disableServiceWorker === undefined) {
            site.disableServiceWorker = false;
        } else if (!site.disableServiceWorker instanceof Boolean) {
            reject(`Invalid DjinnJS configuration. The disableServiceWorker value must be a boolean.`);
        }

        if (site.gtagId === undefined) {
            site.gtagId = '';
        } else if (!site.gtagId instanceof String) {
            reject(`Invalid DjinnJS configuration. The gtagId value must be a string.`);
        }

        if (site.defaultTransition === undefined) {
            site.defaultTransition = 'fade';
        } else if (!site.defaultTransition instanceof String) {
            reject(`Invalid DjinnJS configuration. The defaultTransition value must be a string.`);
        }

        if (site.disablePjax === undefined) {
            site.disablePjax = false;
        } else if (!site.disablePjax instanceof Boolean) {
            reject(`Invalid DjinnJS configuration. The disablePjax value must be a boolean.`);
        }

        if (site.disablePrefetching === undefined) {
            site.disablePrefetching = false;
        } else if (!site.disablePrefetching instanceof Boolean) {
            reject(`Invalid DjinnJS configuration. The disablePrefetching value must be a boolean.`);
        }

        if (site.usePercentage === undefined) {
            site.usePercentage = false;
        } else if (!site.usePercentage instanceof Boolean) {
            reject(`Invalid DjinnJS configuration. The usePercentage value must be a boolean.`);
        }

        let env = site.env || yargs.e || yargs.env;
        if (!env) {
            env = 'production';
        }
        if (!env instanceof String) {
            reject(`Invalid DjinnJS configuration. The env value must be a string.`);
        }
        site.env = env.toLowerCase().trim();
        resolve(site);
    });
}
module.exports = checkSite;
