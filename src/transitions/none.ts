export function none(selector: string, newHTML: string, transitionData: string): Promise<{}> {
    return new Promise(resolve => {
        if (transitionData === 'smooth') {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        } else {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'auto',
            });
        }

        const main = document.body.querySelector(selector) as HTMLElement;
        main.innerHTML = newHTML;
        resolve();
    });
}
