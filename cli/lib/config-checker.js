const yargs = require('yargs').argv;

function checkSite(site, multisite = false) {
    return new Promise((resolve, reject) => {
        if (multisite) {
            if (site.handle === undefined) {
                reject(`Invalid DjinnJS configuration. Sites require a handle when running DjinnJS in multisite mode.`);
            } else if (typeof site.handle !== 'string') {
                reject(`Invalid DjinnJS configuration. The handle value must be a string.`);
            }
        }

        if (site.src === undefined) {
            site.src = './src';
        } else if (typeof site.src !== 'string' && !Array.isArray(site.src)) {
            reject(`Invalid DjinnJS configuration. The src value must be a string or an array of strings.`);
        }

        if (site.publicDir === undefined) {
            site.publicDir = './public';
        } else if (typeof site.publicDir !== 'string') {
            reject(`Invalid DjinnJS configuration. The publicDir value must be a string.`);
        } else {
            site.publicDir = site.publicDir.trim();
        }

        if (site.outDir === undefined) {
            site.outDir = 'assets';
        } else if (typeof site.outDir !== 'string') {
            reject(`Invalid DjinnJS configuration. The outDir value must be a string.`);
        } else {
            site.outDir = site.outDir.toLowerCase().trim();
        }

        if (site.disableServiceWorker === undefined) {
            site.disableServiceWorker = false;
        } else if (typeof site.disableServiceWorker !== 'boolean') {
            reject(`Invalid DjinnJS configuration. The disableServiceWorker value must be a boolean.`);
        }

        if (site.gtagId === undefined) {
            site.gtagId = '';
        } else if (typeof site.gtagId !== 'string') {
            reject(`Invalid DjinnJS configuration. The gtagId value must be a string.`);
        }

        if (site.defaultTransition === undefined) {
            site.defaultTransition = 'fade';
        } else if (typeof site.defaultTransition !== 'string') {
            reject(`Invalid DjinnJS configuration. The defaultTransition value must be a string.`);
        }

        if (site.disablePjax === undefined) {
            site.disablePjax = false;
        } else if (typeof site.disablePjax !== 'boolean') {
            reject(`Invalid DjinnJS configuration. The disablePjax value must be a boolean.`);
        }

        if (site.disablePrefetching === undefined) {
            site.disablePrefetching = false;
        } else if (typeof site.disablePrefetching !== 'boolean') {
            reject(`Invalid DjinnJS configuration. The disablePrefetching value must be a boolean.`);
        }

        if (site.usePercentage === undefined) {
            site.usePercentage = false;
        } else if (typeof site.usePercentage !== 'boolean') {
            reject(`Invalid DjinnJS configuration. The usePercentage value must be a boolean.`);
        }

        let env = site.env || yargs.e || yargs.env;
        if (!env) {
            env = 'production';
        }
        if (typeof env !== 'string') {
            reject(`Invalid DjinnJS configuration. The env value must be a string.`);
        }
        site.env = env.toLowerCase().trim();
        resolve(site);
    });
}
module.exports = checkSite;
