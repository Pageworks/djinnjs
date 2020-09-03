import { fetchCSS } from "./fetch";

export async function parse(el: HTMLElement) {
    let files = [];
    el.querySelectorAll("[css]").forEach(el => {
        const attr = el.getAttribute("css");
        const strings = attr.split(/\s+/g);
        files = [...files, ...strings];
    });
    await fetchCSS(files);
    return;
}
