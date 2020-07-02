module.exports = {
    src: "./src",
    publicDir: "./public",
    outDir: "assets",
    noCachePattern: /(\.json)$|(cachebust\.js)/gi,
    cachebustURL: "/cachebust.json",
    resourcePattern: /(\.js)$|(\.css)$|(\.mjs)$|(\.cjs)$|(\.png)$|(\.jpg)$|(\.gif)$|(\.webp)$|(\.jpeg)$|(\.svg)$/gi,
    serviceWorker: true,
    silent: true,
    env: "production",
    gtagId: "",
    pjax: true,
    predictivePrefetching: true,
    followRedirects: true,
    usePercentage: false,
    pageJumpOffset: null,
    minimumConnection: "4g",
};
