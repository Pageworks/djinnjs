if (env.threadPool !== 0) {
    await import(`${location.origin}/${djinnjsOutDir}/service-worker-bootstrap.mjs`);
} else {
    const event = new CustomEvent("pjax:init");
    document.dispatchEvent(event);
}
