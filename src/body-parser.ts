import { djinnjsOutDir } from "./config";

export async function parse(el: HTMLElement) {
    let files = [];
    el.querySelectorAll("[css]").forEach(el => {
        const attr = el.getAttribute("css");
        const strings = attr.split(/\s+/g);
        files = [...files, ...strings];
    });
    if (files.length) {
        const { fetchCSS } = await import(`${location.origin}/${djinnjsOutDir}/fetch.mjs`);
        await fetchCSS(files);
    }
    return;
}
