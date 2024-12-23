export interface Env {
	addEvent: (
		node: HTMLElement,
		event: string,
		handler: EventListenerOrEventListenerObject
	) => RemoveEventListener;
	addGlobalEvent: (
		event: string,
		handler: EventListenerOrEventListenerObject
	) => RemoveEventListener;
	getTopNode: () => HTMLElement;
}

export type RemoveEventListener = () => void;

function getEnv(): Env {
	return {
		addEvent: function (
			node: Node,
			event: string,
			handler: EventListenerOrEventListenerObject
		): RemoveEventListener {
			node.addEventListener(event, handler);
			return () => node.removeEventListener(event, handler);
		},
		addGlobalEvent: function (
			event: string,
			handler: EventListenerOrEventListenerObject
		): RemoveEventListener {
			document.addEventListener(event, handler);
			return () => document.removeEventListener(event, handler);
		},
		getTopNode: function (): HTMLElement {
			return window.document.body as HTMLElement;
		},
	};
}

export const env = getEnv();

export function setEnv(update: Partial<Env>): void {
	Object.assign(env, update);
}
