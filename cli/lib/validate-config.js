const yargs = require("yargs").argv;

module.exports = function valdiateConfig(config, customConfig) {
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

    switch (typeof customConfig.terser) {
        case "object":
            config.terser = customConfig.terser;
            break;
        case "undefined":
            break;
        default:
            console.log(`Invalid DjinnJS configuration. The terser value must be an object.`);
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
