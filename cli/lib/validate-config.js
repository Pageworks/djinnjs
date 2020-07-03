const yargs = require("yargs").argv;

module.exports = function valdiateConfig(config, customConfig) {
    if (customConfig.noCachePattern instanceof RegExp) {
        config.noCachePattern = customConfig.noCachePattern;
    } else if (typeof customConfig.noCachePattern !== "undefined") {
        console.log(`Invalid DjinnJS configuration. The noCachePattern value must be a regular expression pattern.`);
        process.exit(1);
    }

    if (customConfig.resourcePattern instanceof RegExp) {
        config.resourcePattern = customConfig.resourcePattern;
    } else if (typeof customConfig.resourcePattern !== "undefined") {
        console.log(`Invalid DjinnJS configuration. The resourcePattern value must be a regular expression pattern.`);
        process.exit(1);
    }

    switch (typeof customConfig.cachebustURL) {
        case "string":
            config.cachebustURL = customConfig.cachebustURL;
            break;
        case "undefined":
            break;
        default:
            console.log(`Invalid DjinnJS configuration. The cachebustURL value must be a string.`);
            process.exit(1);
    }

    if (typeof customConfig.src !== "undefined") {
        if (Array.isArray(customConfig.src)) {
            for (let i = 0; i < customConfig.src.length; i++) {
                if (typeof customConfig.src[i] !== "string") {
                    console.log(`Invalid DjinnJS configuration. The src value ${customConfig.src[i]} is not a string.`);
                    process.exit(1);
                }
            }
            config.src = customConfig.src;
        } else if (typeof customConfig.src === "string") {
            config.src = [customConfig.src];
        } else {
            console.log(`Invalid DjinnJS configuration. The src value must be a string or an array of strings.`);
            process.exit(1);
        }
    }

    switch (typeof customConfig.publicDir) {
        case "string":
            config.publicDir = customConfig.publicDir;
            break;
        case "undefined":
            break;
        default:
            console.log(`Invalid DjinnJS configuration. The publicDir value must be a string.`);
            process.exit(1);
    }

    switch (typeof customConfig.outDir) {
        case "string":
            config.outDir = customConfig.outDir.toLowerCase().trim();
            break;
        case "undefined":
            break;
        default:
            console.log(`Invalid DjinnJS configuration. The outDir value must be a string.`);
            process.exit(1);
    }

    if (typeof customConfig.serviceWorker !== "undefined") {
        if (customConfig.serviceWorker === null) {
            config.serviceWorker = false;
        } else if (typeof customConfig.serviceWorker === "boolean") {
            if (customConfig.serviceWorker === true) {
                config.serviceWorker = "offline-first";
            } else {
                config.serviceWorker = false;
            }
        } else if (typeof customConfig.serviceWorker === "string") {
            switch (customConfig.serviceWorker) {
                case "offline-first":
                    config.serviceWorker = "offline-first";
                    break;
                case "offline-backup":
                    config.serviceWorker = "offline-backup";
                    break;
                case "resources-only":
                    config.serviceWorker = "resources-only";
                    break;
                default:
                    config.serviceWorker = "offline-first";
                    break;
            }
        } else {
            console.log(`Invalid DjinnJS configuration. The serviceWorker value must be a boolean, null, or a string: 'offline-first', 'offline-backup', 'resources-only'`);
            process.exit(1);
        }
    } else {
        config.serviceWorker = "offline-first";
    }

    switch (typeof customConfig.gtagId) {
        case "string":
            config.gtagId = customConfig.gtagId;
            break;
        case "undefined":
            break;
        default:
            console.log(`Invalid DjinnJS configuration. The gtagId value must be a string.`);
            process.exit(1);
    }

    switch (typeof customConfig.pjax) {
        case "boolean":
            config.pjax = customConfig.pjax;
            break;
        case "undefined":
            break;
        default:
            console.log(`Invalid DjinnJS configuration. The pjax value must be a boolean.`);
            process.exit(1);
    }

    switch (typeof customConfig.followRedirects) {
        case "boolean":
            config.followRedirects = customConfig.followRedirects;
            break;
        case "undefined":
            break;
        default:
            console.log(`Invalid DjinnJS configuration. The followRedirects value must be a boolean.`);
            process.exit(1);
    }

    switch (typeof customConfig.predictivePrefetching) {
        case "boolean":
            config.predictivePrefetching = customConfig.predictivePrefetching;
            break;
        case "undefined":
            break;
        default:
            console.log(`Invalid DjinnJS configuration. The predictivePrefetching value must be a boolean.`);
            process.exit(1);
    }

    switch (typeof customConfig.usePercentage) {
        case "boolean":
            config.usePercentage = customConfig.usePercentage;
            break;
        case "undefined":
            break;
        default:
            console.log(`Invalid DjinnJS configuration. The usePercentage value must be a boolean.`);
            process.exit(1);
    }

    switch (typeof customConfig.pageJumpOffset) {
        case "number":
            config.pageJumpOffset = customConfig.pageJumpOffset;
            break;
        case "undefined":
            break;
        default:
            console.log(`Invalid DjinnJS configuration. The pageJumpOffset value must be a number.`);
            process.exit(1);
    }

    switch (typeof customConfig.silent) {
        case "boolean":
            config.silent = customConfig.silent;
            break;
        case "undefined":
            break;
        default:
            console.log(`Invalid DjinnJS configuration. The silent value must be a boolean.`);
            process.exit(1);
    }

    switch (typeof customConfig.minimumConnection) {
        case "string":
            switch (customConfig.minimumConnection) {
                case "4g":
                    config.minimumConnection = customConfig.minimumConnection;
                    break;
                case "3g":
                    config.minimumConnection = customConfig.minimumConnection;
                    break;
                case "2g":
                    config.minimumConnection = customConfig.minimumConnection;
                    break;
                case "slow-2g":
                    config.minimumConnection = customConfig.minimumConnection;
                    break;
                default:
                    console.log(`Invalid DjinnJS configuration. The minimumConnection must be 4g, 3g, 2g, or slow-2g.`);
                    process.exit(1);
                    break;
            }
            break;
        case "undefined":
            break;
        default:
            console.log(`Invalid DjinnJS configuration. The minimumConnection value must be a string.`);
            process.exit(1);
    }

    let env;
    if (typeof customConfig.env === "string") {
        env = customConfig.env;
    } else {
        env = yargs.e || yargs.env || null;
    }
    if (!env) {
        env = "production";
    }
    config.env = env.toLowerCase().trim();
    return config;
};
