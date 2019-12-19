type djinnjsConfig = {
    src?: string | Array<string>;
    publicDir?: string = './public';
    outDir?: string = 'assets';
    noCachePattern?: RegExp;
    sites?: Array<{
        handle: string;
        publicDir: string;
        outDir?: string = 'assets';
        src: string | Array<string>;
    }>;
    transitions?: Array<{
        handle: string;
        file: string;
    }>;
};
