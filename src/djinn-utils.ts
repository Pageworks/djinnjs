/**
 * Looks through the new HTML for any inline scripts and attempts to append them to the documents head.
 */
export function handleInlineScripts(selectors: Array<string>): void {
    const views = [];
    for (let i = 0; i < selectors.length; i++) {
        views.push(document.documentElement.querySelector(selectors[i]));
    }
    for (let i = 0; i < views.length; i++) {
        views[i].querySelectorAll("script").forEach(script => {
            const newScript = document.createElement("script");
            newScript.type = script.type;
            newScript.noModule = script.noModule;
            newScript.crossOrigin = script.crossOrigin;
            newScript.integrity = script.integrity;
            newScript.nonce = script.nonce;
            newScript.referrerPolicy = script.referrerPolicy;

            if (newScript.type !== "module") {
                if (script.async) {
                    newScript.async = true;
                } else {
                    newScript.defer = true;
                }
            }

            if (script?.src || script?.id || script.getAttribute("pjax-script-id")) {
                let scriptSelector = "script";
                scriptSelector += `[src="${script?.src}"]` || `#${script?.id}` || `[pjax-script-id="${script.getAttribute("pjax-script-id")}"]`;
                const existingScript = document.head.querySelector(scriptSelector);
                if (existingScript) {
                    const preventRemount = script.getAttribute("pjax-prevent-remount");
                    if (preventRemount === null) {
                        existingScript.remove();
                        newScript.src = script.src;
                        document.head.appendChild(newScript);
                    }
                } else {
                    newScript.src = script.src;
                    document.head.appendChild(newScript);
                }
            } else {
                newScript.innerHTML = script.innerHTML;
                document.head.appendChild(newScript);
            }
        });
    }
}

export function scrollOrResetPage(): void {
    if (window.location.hash) {
        /** Scroll to hash element */
        const element = document.body.querySelector(window.location.hash);
        if (element) {
            element.scrollIntoView();
            return;
        }
    }
    /** Scroll to top of page */
    window.scrollTo(0, 0);
}
