/** Attempt to register a service worker */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register(`${window.location.origin}/service-worker.js`, { scope: "/" })
        .then(() => {
            navigator.serviceWorker.controller.postMessage({
                type: "cachebust",
                url: window.location.href,
            });
        })
        .catch(error => {
            console.error("Registration failed with " + error);
        })
        .then(() => {
            const event = new CustomEvent("pjax:init");
            document.dispatchEvent(event);
        });
} else {
    const event = new CustomEvent("pjax:init");
    document.dispatchEvent(event);
}
