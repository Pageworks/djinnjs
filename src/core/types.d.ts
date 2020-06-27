export type PjaxResources = {
    eager: Array<string>;
    lazy: Array<string>;
};

export type WorkerResponse = {
    type: "eager" | "lazy" | "parse";
    files: Array<string>;
    requestUid: string | null;
    pjaxFiles: PjaxResources;
};
