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
            reject(`Invalid DjinnJS configuration. No sources provided.`);
        } else if (!site.src instanceof String && !site.src instanceof Array) {
            reject(`Invalid DjinnJS configuration. The src value must be a string or an array of strings.`);
        }

        if (site.publicDir === undefined) {
            site.publicDir = './public';
        } else if (!site.publicDir instanceof String) {
            reject(`Invalid DjinnJS configuration. The publicDir value must be a string.`);
        }

        if (site.outDir === undefined) {
            site.outDir = 'assets';
        } else if (!site.outDir instanceof String) {
            reject(`Invalid DjinnJS configuration. The outDir value must be a string.`);
        }
        resolve(site);
    });
}
module.exports = checkSite;
