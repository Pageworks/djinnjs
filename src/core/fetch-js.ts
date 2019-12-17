/**
 * Appends JavaScript resources to the documents head if it hasn't already been loaded.
 * @param filenames - a filename `sting` or an array of `string` JS filenames or a URL -- exclude the file path and extension if local
 */
export function fetchJS(filenames: string | Array<string>): Promise<{}> {
	return new Promise(resolve => {
		const resourceList = filenames instanceof Array ? filenames : [filenames];
		if (resourceList.length === 0) {
			resolve();
		}

		let loaded = 0;
		for (let i = 0; i < resourceList.length; i++) {
			const filename = resourceList[i];
			const local = filename.slice(0, 7).toLowerCase() !== 'http://' && filename.slice(0, 8).toLowerCase() !== 'https://';
			let el: HTMLScriptElement = local ? document.head.querySelector(`script[file="${filename}.js"]`) : document.head.querySelector(`script[src="${filename}"]`);
			if (!el) {
				el = document.createElement('script');
				if (local) {
					el.setAttribute('file', `${filename}.js`);
				}
				el.type = 'module';
				if (local) {
					el.src = `${window.location.origin}/assets/${filename}.js`;
				} else {
					el.src = filename;
				}
				el.addEventListener('load', () => {
					loaded++;
					if (loaded === resourceList.length) {
						resolve();
					}
				});
				el.addEventListener('error', () => {
					loaded++;
					if (loaded === resourceList.length) {
						resolve();
					}
				});
				document.head.append(el);
			} else {
				loaded++;
				if (loaded === resourceList.length) {
					resolve();
				}
			}
		}
	});
}
