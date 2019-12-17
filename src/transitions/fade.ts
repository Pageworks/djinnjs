export function fade(selector: string, newHTML: string, transitionData: string): Promise<{}> {
	return new Promise(resolve => {
		/** Transition reset */
		const main = document.body.querySelector(selector) as HTMLElement;
		main.style.transition = 'all 0ms 0ms linear';
		main.style.opacity = '1';

		setTimeout(() => {
			/** Transition */
			main.style.transition = 'opacity 150ms ease-out';
			main.style.opacity = '0';
			setTimeout(() => {
				main.innerHTML = newHTML;

				switch (transitionData) {
					case 'no-scroll':
						break;
					case 'smooth-scroll':
						window.scroll({
							top: 0,
							left: 0,
							behavior: 'smooth',
						});
						break;
					default:
						window.scroll({
							top: 0,
							left: 0,
							behavior: 'auto',
						});
						break;
				}

				main.style.transition = 'opacity 600ms ease-in';
				main.style.opacity = '1';
				resolve();
			}, 175);
		}, 15);
	});
}
