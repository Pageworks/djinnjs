/**
 * Parses HTML and collects all requested CSS files.
 * @param body - the body text to be parsed
 */
async function parseCSS(body: string) {
    const matches = body.match(/(css\=[\'\"].*?[\'\"])/gi);
    if (matches === null || matches.length === 0) {
        return [];
    }
    const files: Array<string> = [];
    if (matches) {
        matches.map((match: string) => {
            const clean = match.replace(/(css\=[\'\"])|[\'\"]$/g, "");
            const filenames = clean.trim().split(/\s+/g);
            if (filenames) {
                filenames.map(filename => {
                    const cleanFilename = filename
                        .trim()
                        .toLowerCase()
                        .replace(/(\.css)$/g, "");
                    if (cleanFilename !== "") {
                        files.push(cleanFilename);
                    }
                });
            }
        });
    }
    const uniqueFiles: Array<string> = [];
    for (let i = 0; i < files.length; i++) {
        let isUnique = true;
        for (let k = 0; k < uniqueFiles.length; k++) {
            if (files[i] === uniqueFiles[k]) {
                isUnique = false;
            }
        }
        if (isUnique) {
            uniqueFiles.push(files[i]);
        }
    }
    return uniqueFiles;
}

/** Incoming request from the Runtime class. */
onmessage = (e: MessageEvent) => {
    switch (e.data.type) {
        case "parse":
            parseCSS(e.data.body).then(data => {
                // @ts-ignore
                postMessage({
                    type: "load",
                    files: data,
                    requestUid: e.data?.requestUid ?? null,
                });
            });
            break;
    }
};
