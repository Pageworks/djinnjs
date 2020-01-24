interface TransitionObject {
    scroll: ScrollBehavior | "none";
    direction: number;
}

export function slide(selector: string, newHTML: string, target: HTMLElement | null): Promise<{}> {
    return new Promise(resolve => {
        const transition: TransitionObject = {
            scroll: "auto",
            direction: 1,
        };

        if (target) {
            const scrollBehavior = target
                .getAttribute("scroll")
                ?.toLowerCase()
                ?.trim();
            if (scrollBehavior === "auto" || scrollBehavior === "smooth" || scrollBehavior === "none") {
                transition.scroll = scrollBehavior;
            }

            const targetDirection = target
                .getAttribute("direction")
                ?.toLowerCase()
                ?.trim();
            if (targetDirection === "right") {
                transition.direction = 1;
            } else if (targetDirection === "left") {
                transition.direction = -1;
            }
        }

        if (transition.scroll !== "none") {
            window.scroll({
                top: 0,
                left: 0,
                behavior: transition.scroll,
            });
        }

        /** Prepare for update */
        const currentMain = document.body.querySelector(selector) as HTMLElement;
        const newMain = document.createElement(selector) as HTMLElement;
        newMain.innerHTML = newHTML;
        newMain.dataset.id = currentMain.dataset.id;
        newMain.style.transform = `translateX(${100 * -transition.direction}vw)`;
        currentMain.before(newMain);

        /** Transition reset */
        currentMain.style.transform = "translateX(0)";
        currentMain.style.opacity = "1";
        currentMain.style.position = "absolute";
        currentMain.style.top = "0";
        currentMain.style.left = "0";
        currentMain.style.width = "100vw";

        setTimeout(() => {
            /** Transition */
            currentMain.style.transition = "transform 600ms ease-in-out";
            currentMain.style.transform = `translateX(${100 * transition.direction}vw)`;
            newMain.style.transition = "transform 600ms ease-in-out";
            newMain.style.transform = "translateX(0)";

            setTimeout(() => {
                currentMain.remove();
                resolve();
            }, 615);
        }, 15);
    });
}
