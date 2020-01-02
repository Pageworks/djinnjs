/**
 * Appends JavaScript resources to the documents head if it hasn't already been loaded.
 * @param filenames - a filename `sting` or an array of `string` JS filenames or a URL -- exclude the file path and extension if local
 */
export declare function fetchJS(filenames: string | Array<string>): Promise<{}>;
/**
 * Appends resources to the documents head if it hasn't already been loaded.
 * @param filenames - a filename `sting` or an array of `string` CSS filenames or a URL -- exclude the file path and extension if local
 */
export declare function fetchCSS(filenames: string | Array<string>): Promise<{}>;
