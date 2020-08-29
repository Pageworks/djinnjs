export type WorkerResponse = {
    type: "load";
    files: Array<string>;
    requestUid: string | null;
};

export type WebComponentLoad = null | "lazy" | "eager";
