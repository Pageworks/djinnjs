type djinnjsConfig = {
    src?: string | Array<string>;
    publicDir?: string = './public';
    outDir?: string = 'assets';
    noCachePattern?: RegExp;
    cachebustURL?: string = `/cachebust.json`;
    disableServiceWorker?: boolean = false;
    silent?: boolean = true;
    sites?: Array<{
        handle: string;
        publicDir: string;
        outDir?: string = 'assets';
        src: string | Array<string>;
        disableServiceWorker?: boolean = false;
    }>;
    transitions?: Array<{
        handle: string;
        file: string;
    }>;
};
