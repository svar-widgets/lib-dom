import type { Env, RemoveEventListener } from "./env";

export const salesForceEnv: Partial<Env> = {
	detect() {
		if (typeof window === "undefined") return false;
		return (
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			!!(window as any)["Sfdc"] ||
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			!!(window as any)["$A"] ||
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			!!(window as any)["Aura"] ||
			"$shadowResolver$" in document.body
		);
	},
	addGlobalEvent: function (
		event: string,
		handler: EventListenerOrEventListenerObject,
		rel: HTMLElement
	): RemoveEventListener {
		const d = salesForceEnv.getTopNode(rel);
		d.addEventListener(event, handler);
		return () => d.removeEventListener(event, handler);
	},
	getTopNode: function (rel: HTMLElement): HTMLElement {
		return rel.closest('[data-wx-root="true"]') as HTMLElement;
	},
};
