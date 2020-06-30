import { djinnjsOutDir } from "./config";

(() => {
    // Adds Web Components support
    if (typeof CustomElementRegistry === "undefined") {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/@webcomponents/webcomponentsjs@2.4.3/webcomponents-bundle.js";
        document.head.appendChild(script);
    }
    // Adds Intersection Observer support
    if (!("IntersectionObserver" in window) || !("IntersectionObserverEntry" in window) || !("intersectionRatio" in window.IntersectionObserverEntry.prototype)) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/intersection-observer@0.11.0/intersection-observer.js";
        document.head.appendChild(script);
    }
    try {
        import(`${location.origin}/${djinnjsOutDir}/dynamic-runtime.mjs`);
    } catch (error) {
        const script = document.createElement("script");
        script.src = `${location.origin}/${djinnjsOutDir}/runtime.mjs`;
        document.head.appendChild(script);
    }
})();
