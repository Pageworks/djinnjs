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
        import(`${location.origin}/${djinnjsOutDir}/runtime.mjs`);
    } catch (error) {
        console.error(error);
        alert("You are using an outdated version of this browser and parts of this website will not work as intended.");
        const link = document.createElement("link");
        link.href = `${location.origin}/${djinnjsOutDir}/noscript.css`;
        link.rel = "stylesheet";
        document.head.appendChild(link);
    }
})();
