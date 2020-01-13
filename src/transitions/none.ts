export function none(selector: string, newHTML: string, target: HTMLElement | null): Promise<{}> {
    return new Promise(resolve => {
        let behavior: ScrollBehavior = "auto";
        if (target && target.getAttribute("scroll-behavior")) {
            let desiredBehavior = target.getAttribute("scroll-behavior");
            if (desiredBehavior === "auto" || desiredBehavior === "smooth") {
                behavior = desiredBehavior;
            }
        }
        window.scroll({
            top: 0,
            left: 0,
            behavior: behavior,
        });
        const view = document.body.querySelector(selector) as HTMLElement;
        view.innerHTML = newHTML;
        resolve();
    });
}
