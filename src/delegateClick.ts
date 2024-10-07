import type { ActionReturn } from "./common";
import { locate, id as parseId } from "./locate";

export type IHandlersHash = { [key: string]: CallableFunction };

export function delegateEvent(
	node: HTMLElement,
	handlers: IHandlersHash | CallableFunction,
	event: string
): ActionReturn {
	function handleEvent(ev: Event) {
		const node = locate(ev);
		if (!node) return;
		const id = parseId(node.dataset.id);

		if (typeof handlers === "function") return handlers(id, ev);

		let action;
		let test = ev.target as HTMLElement;
		while (test != node) {
			action = test.dataset ? test.dataset.action : null;
			if (action) {
				if (handlers[action]) {
					handlers[action](id, ev);
					return;
				}
			}
			test = test.parentNode as HTMLElement;
		}
		if (handlers[event]) handlers[event](id, ev);
	}
	node.addEventListener(event, handleEvent);
}

export function delegateClick(
	node: HTMLElement,
	handlers: IHandlersHash
): ActionReturn {
	delegateEvent(node, handlers, "click");
	if (handlers.dblclick) delegateEvent(node, handlers.dblclick, "dblclick");
}
