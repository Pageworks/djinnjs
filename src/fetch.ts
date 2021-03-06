import { djinnjsOutDir } from "./config";

/**
 * Appends resources to the documents head if it hasn't already been loaded.
 * @param filenames - a filename `sting` or an array of `string` CSS filenames or a URL -- exclude the extension
 * @deprecated will be removed in v1.0.0 - use the `djinnjs/utilities` version
 */
export function fetchCSS(filenames: string | Array<string>): Promise<{}> {
    return new Promise(resolve => {
        const resourceList = filenames instanceof Array ? filenames : [filenames];
        if (resourceList.length === 0) {
            resolve();
        }

        let loaded = 0;
        for (let i = 0; i < resourceList.length; i++) {
            const filename = `${resourceList[i].replace(/(\.css)$/gi, "")}.css`;
            const isUrl = new RegExp(/^(http)/gi).test(filename);
            let el: HTMLLinkElement = document.head.querySelector(`[file="${filename}"]`) || document.head.querySelector(`link[href="${filename}"]`) || null;
            if (!el) {
                el = document.createElement("link");
                el.rel = "stylesheet";
                if (isUrl) {
                    el.href = `${filename}`;
                } else {
                    el.setAttribute("file", `${filename}`);
                    el.href = `${location.origin}/${djinnjsOutDir}/${filename}`;
                }
                el.addEventListener("load", () => {
                    loaded++;
                    if (loaded === resourceList.length) {
                        resolve();
                    }
                });
                el.addEventListener("error", () => {
                    loaded++;
                    if (loaded === resourceList.length) {
                        resolve();
                    }
                });
                document.head.appendChild(el);
            } else {
                loaded++;
                if (loaded === resourceList.length) {
                    resolve();
                }
            }
        }
    });
}
