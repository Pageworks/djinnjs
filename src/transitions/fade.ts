interface TransitionObject {
    scroll?: ScrollBehavior | 'none';
    duration?: number;
}

export function fade(selector: string, newHTML: string, transitionData: string): Promise<{}> {
    return new Promise(resolve => {
        /** Transition reset */
        const main = document.body.querySelector(selector) as HTMLElement;
        main.style.transition = "all 0ms 0ms linear";
        main.style.opacity = "1";

        const transition: TransitionObject = {
            scroll: 'auto',
            duration: 450,
        };
        if (transitionData) {
            const customData: TransitionObject = JSON.parse(transitionData);
            if (customData) {
                if ((customData?.scroll && customData.scroll === 'smooth') || customData.scroll === 'auto' || customData.scroll === 'none') {
                    transition.scroll = customData.scroll;
                }
                if (customData?.duration && typeof customData.duration === 'number') {
                    transition.duration = customData.duration;
                }
            } else {
                if (transitionData === 'smooth-scroll' || transitionData === 'smooth') {
                    transition.scroll = 'smooth';
                } else if (transitionData === 'no-scroll' || transitionData === 'none') {
                    transition.scroll = 'none';
                }
            }
        }

        setTimeout(() => {
            /** Transition */
            main.style.transition = `opacity ${transition.duration / 2}ms ease-out`;
            main.style.opacity = '0';
            setTimeout(() => {
                main.innerHTML = newHTML;

                switch (transition.scroll) {
                    case 'none':
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
                main.style.opacity = '1';
                resolve();
            }, transition.duration / 2 + 15);
        }, 15);
    });
}
