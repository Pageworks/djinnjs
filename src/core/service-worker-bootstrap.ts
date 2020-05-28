import { message } from "../web_modules/broadcaster";
import { env } from "./env";
import { usePjax } from "./config";

/** Attempt to register a service worker */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register(`${window.location.origin}/service-worker.js`, { scope: "/" })
        .then(() => {
            /** Verify the service worker was registered correctly */
            if (navigator.serviceWorker.controller) {
                if (env.connection !== "2g" && env.connection !== "slow-2g" && usePjax) {
                    /** Tell Pjax to check if the current page is stale */
                    message({
                        recipient: "pjax",
                        type: "init-worker",
                        maxAttempts: Infinity,
                    });
                }
            }
        })
        .catch(error => {
            console.error("Registration failed with " + error);
        });
}
