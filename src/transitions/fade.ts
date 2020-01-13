interface TransitionObject {
    scroll?: ScrollBehavior | "none";
    duration?: number;
}

export function fade(selector: string, newHTML: string, target: HTMLElement | null): Promise<{}> {
    return new Promise(resolve => {
        /** Transition reset */
        const main = document.body.querySelector(selector) as HTMLElement;
        main.style.transition = "all 0ms 0ms linear";
        main.style.opacity = "1";

        const transition: TransitionObject = {
            scroll: "auto",
            duration: 450,
        };
        if (target) {
            const scrollBehavior = target.getAttribute("scroll");
            if (scrollBehavior === "auto" || scrollBehavior === "smooth") {
                transition.scroll = scrollBehavior;
            }

            const desiredDuration = target.getAttribute("duration");
            // @ts-ignore
            if (!isNaN(desiredDuration)) {
                transition.duration = parseInt(desiredDuration);
            }
        }

        setTimeout(() => {
            /** Transition */
            main.style.transition = `opacity ${transition.duration / 2}ms ease-out`;
            main.style.opacity = "0";
            setTimeout(() => {
                main.innerHTML = newHTML;

                switch (transition.scroll) {
                    case "none":
                        break;
                    default:
                        window.scroll({
                            top: 0,
                            left: 0,
                            behavior: transition.scroll,
                        });
                        break;
                }

                main.style.transition = `opacity ${transition.duration / 2}ms ease-in`;
                main.style.opacity = "1";
                resolve();
            }, transition.duration / 2 + 15);
        }, 15);
    });
}
