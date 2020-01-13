export function none(selector: string, newHTML: string, target: HTMLElement | null): Promise<{}> {
    return new Promise(resolve => {
        let behavior: ScrollBehavior | "none" = "auto";
        if (target) {
            const desiredBehavior = target.getAttribute("scroll");
            if (desiredBehavior === "auto" || desiredBehavior === "smooth" || desiredBehavior === "none") {
                behavior = desiredBehavior;
            }
        }
        if (behavior !== "none") {
            window.scroll({
                top: 0,
                left: 0,
                behavior: behavior,
            });
        }
        const view = document.body.querySelector(selector) as HTMLElement;
        view.innerHTML = newHTML;
        resolve();
    });
}
