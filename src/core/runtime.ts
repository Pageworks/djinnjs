import { env, debug } from './env';
import { broadcaster } from './broadcaster';
import { fetchCSS } from './fetch-css';
import { fetchJS } from './fetch-js';

interface PjaxResources {
	eager: Array<string>;
	lazy: Array<string>;
}

interface WorkerResponse {
	type: 'eager' | 'lazy' | 'parse';
	files: Array<string>;
	requestUid: string | null;
	pjaxFiles: PjaxResources;
}

type WebComponentLoad = null | 'lazy' | 'eager';

class Runtime {
	private _bodyParserWorker: Worker;
	private _io: IntersectionObserver;
	private _loadingMessage: HTMLElement;

	constructor() {
		this._bodyParserWorker = new Worker(`${window.location.origin}/assets/runtime-worker.js`);
		this._loadingMessage = document.body.querySelector('page-loading span');
		window.addEventListener('load', this.handleLoadEvent);
	}

	/**
	 * Initializes the Runtime class.
	 */
	private init(): void {
		this._loadingMessage.innerHTML = 'Collecting resources';
		broadcaster.hookup('runtime', this.inbox.bind(this));
		this._bodyParserWorker.postMessage({
			type: 'eager',
			body: document.body.innerHTML,
		});
		this._bodyParserWorker.onmessage = this.handleWorkerMessage.bind(this);
		this._io = new IntersectionObserver(this.intersectionCallback);
	}
	private handleLoadEvent: EventListener = this.init.bind(this);

	/**
	 * The public inbox for the Runtime class. All incoming messages sent through the `Broadcaster` will be received here.
	 * @param data - the `MessageData` passed into the inbox by the `Broadcaster` class
	 */
	private inbox(data: MessageData): void {
		const { type } = data;
		switch (type) {
			case 'load':
				fetchCSS(data.resources);
				break;
			case 'mount-components':
				this.handleWebComponents();
				break;
			case 'parse':
				this.parseHTML(data.body, data.requestUid);
				break;
			default:
				if (debug) {
					console.warn(`Undefined runtime message type: ${type}`);
				}
				return;
		}
	}

	/**
	 * Handles the incoming message from the Runtime web worker.
	 * @param e - the `MessageEvent` object
	 */
	private handleWorkerMessage(e: MessageEvent) {
		const response: WorkerResponse = e.data;
		switch (response.type) {
			case 'eager':
				if (env.domState === 'hard-loading') {
					this._loadingMessage.innerHTML = `Loading resource: <resource-counter>0</resource-counter<span class="-slash">/</span><resource-total>${response.files.length}</resource-total>`;
				}
				fetchCSS(response.files).then(() => {
					env.setDOMState('idling');
					this._bodyParserWorker.postMessage({
						type: 'lazy',
						body: document.body.innerHTML,
					});
				});
				break;
			case 'lazy':
				const ticket = env.startLoading();
				fetchCSS(response.files).then(() => {
					env.stopLoading(ticket);
					this.handleWebComponents();
					if (env.connection !== '2g' && env.connection !== 'slow-2g') {
						fetchJS('pjax').then(() => {
							broadcaster.message(
								'pjax',
								{
									type: 'init',
								},
								'TCP',
								Infinity
							);
						});
					}
				});
				break;
			case 'parse':
				this.fetchPjaxResources(response.pjaxFiles, response.requestUid);
				break;
			default:
				console.warn(`Unknown response type from Body Parser worker: ${response.type}`);
				break;
		}
	}

	private fetchPjaxResources(data: PjaxResources, requestUid: string): void {
		/** Fetch the requested eager CSS files */
		fetchCSS(data.eager).then(() => {
			/** Tell the Pjax class that the eager CSS files have been loaded */
			broadcaster.message('pjax', {
				type: 'css-ready',
				requestUid: requestUid,
			});
			fetchCSS(data.lazy);
		});
	}

	/**
	 * Passes the HTML parse request onto the Runtime web worker.
	 * @param body - the body text to be parsed
	 * @param requestUid - the navigation request unique id
	 */
	private parseHTML(body: string, requestUid: string): void {
		this._bodyParserWorker.postMessage({
			type: 'parse',
			body: body,
			requestUid: requestUid,
		});
	}

	/**
	 * Upgrades a custom element into a web component using the dynamic import syntax.
	 * @param customElementTagName - the JavaScript filename
	 * @param customElement - the `Element` that has been upgraded
	 * @todo Switch to dynamic importing once Edge becomes chromium
	 * @see https://v8.dev/features/dynamic-import
	 */
	private upgradeToWebComponent(customElementTagName: string, customElement: Element): void {
		fetchJS(customElementTagName).then(() => {
			customElement.setAttribute('component-state', 'mounted');
		});
	}

	/**
	 * When a custom element is observed by the `IntersectionObserver` API unobserve the element and attempt to upgrade the web component.
	 * @param entries - an array of `IntersectionObserverEntry` objects
	 */
	private handleIntersection(entries: Array<IntersectionObserverEntry>) {
		for (let i = 0; i < entries.length; i++) {
			if (entries[i].isIntersecting) {
				this._io.unobserve(entries[i].target);
				const customElement = entries[i].target.tagName.toLowerCase().trim();
				if (customElements.get(customElement) === undefined) {
					this.upgradeToWebComponent(customElement, entries[i].target);
				} else {
					entries[i].target.setAttribute('component-state', 'mounted');
				}
			}
		}
	}
	private intersectionCallback: IntersectionObserverCallback = this.handleIntersection.bind(this);

	/**
	 * Collect all custom elements tagged with a `web-component` attribute that have not already been tracked.
	 * If the custom element is tagged with `loading="eager"` upgrade the custom element otherwise track the
	 * custom element with the `IntersectionObserver` API.
	 */
	private handleWebComponents(): void {
		const customElements = Array.from(document.body.querySelectorAll('[web-component]:not([component-state])'));
		for (let i = 0; i < customElements.length; i++) {
			const element = customElements[i];
			const loadType = element.getAttribute('loading') as WebComponentLoad;
			if (loadType === 'eager') {
				const customElement = element.tagName.toLowerCase().trim();
				this.upgradeToWebComponent(customElement, element);
			} else {
				element.setAttribute('component-state', 'unseen');
				this._io.observe(customElements[i]);
			}
		}
	}
}
export const runtime: Runtime = new Runtime();
