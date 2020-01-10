import { env } from "./env";
import { djinnjsOutDir, usePercentage } from "./config";

/**
 * Appends JavaScript resources to the documents head if it hasn't already been loaded.
 * @param filenames - a filename `sting` or an array of `string` JS filenames or a URL -- exclude the extension
 */
export function fetchJS(filenames: string | Array<string>): Promise<{}> {
    return new Promise(resolve => {
        const ticket = env.startLoading();
        const resourceList = filenames instanceof Array ? filenames : [filenames];
        if (resourceList.length === 0) {
            env.stopLoading(ticket);
            resolve();
        }

        let loaded = 0;
        for (let i = 0; i < resourceList.length; i++) {
            const filename = resourceList[i].replace(/(\.js)$/gi, "");
            const isUrl = new RegExp(/^(http)/i).test(filename);
            let el: HTMLScriptElement = document.head.querySelector(`script[file="${filename}.js"]`) || document.head.querySelector(`script[src="${filename}"]`) || null;
            if (!el) {
                el = document.createElement("script");
                if (!isUrl) {
                    el.setAttribute("file", `${filename}.js`);
                }
                el.type = "module";
                if (!isUrl) {
                    el.src = `${window.location.origin}/${djinnjsOutDir}/${filename}.js`;
                } else {
                    el.src = `${filename}.js`;
                }
                el.addEventListener("load", () => {
                    loaded++;
                    if (loaded === resourceList.length) {
                        env.stopLoading(ticket);
                        resolve();
                    }
                });
                el.addEventListener("error", () => {
                    loaded++;
                    if (loaded === resourceList.length) {
                        env.stopLoading(ticket);
                        resolve();
                    }
                });
                document.head.append(el);
            } else {
                loaded++;
                if (loaded === resourceList.length) {
                    env.stopLoading(ticket);
                    resolve();
                }
            }
        }
    });
}

/**
 * Appends resources to the documents head if it hasn't already been loaded.
 * @param filenames - a filename `sting` or an array of `string` CSS filenames or a URL -- exclude the extension
 */
export function fetchCSS(filenames: string | Array<string>): Promise<{}> {
    return new Promise(resolve => {
        const ticket = env.startLoading();
        const resourceList = filenames instanceof Array ? filenames : [filenames];
        if (resourceList.length === 0) {
            env.stopLoading(ticket);
            resolve();
        }

        const loadingMessage = document.body.querySelector("file-loading-value") || null;

        let loaded = 0;
        for (let i = 0; i < resourceList.length; i++) {
            const filename = resourceList[i].replace(/(\.css)$/gi, "");
            const isUrl = new RegExp(/^(http)/gi).test(filename);
            let el: HTMLLinkElement = document.head.querySelector(`link[file="${filename}.css"]`) || document.head.querySelector(`link[href="${filename}"]`) || null;
            if (!el) {
                el = document.createElement("link");
                if (!isUrl) {
                    el.setAttribute("file", `${filename}.css`);
                }
                el.rel = "stylesheet";
                if (!isUrl) {
                    el.href = `${window.location.origin}/${djinnjsOutDir}/${filename}.css`;
                } else {
                    el.href = `${filename}.css`;
                }
                el.addEventListener("load", () => {
                    loaded++;
                    if (env.domState === "hard-loading" && loadingMessage) {
                        if (usePercentage) {
                            loadingMessage.innerHTML = `${Math.round((loaded / resourceList.length) * 100)}%`;
                        } else {
                            loadingMessage.innerHTML = `${loaded}/${resourceList.length}`;
                        }
                    }
                    if (loaded === resourceList.length) {
                        env.stopLoading(ticket);
                        resolve();
                    }
                });
                el.addEventListener("error", () => {
                    loaded++;
                    if (env.domState === "hard-loading" && loadingMessage) {
                        if (usePercentage) {
                            loadingMessage.innerHTML = `${Math.round((loaded / resourceList.length) * 100)}%`;
                        } else {
                            loadingMessage.innerHTML = `${loaded}/${resourceList.length}`;
                        }
                    }
                    if (loaded === resourceList.length) {
                        env.stopLoading(ticket);
                        resolve();
                    }
                });
                document.head.append(el);
            } else {
                loaded++;
                if (env.domState === "hard-loading" && loadingMessage) {
                    if (usePercentage) {
                        loadingMessage.innerHTML = `${Math.round((loaded / resourceList.length) * 100)}%`;
                    } else {
                        loadingMessage.innerHTML = `${loaded}/${resourceList.length}`;
                    }
                }
                if (loaded === resourceList.length) {
                    env.stopLoading(ticket);
                    resolve();
                }
            }
        }
    });
}
