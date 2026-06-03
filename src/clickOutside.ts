import { remove } from "./array";
import { env, RemoveEventListener } from "./env";
import type { ActionReturn } from "./common";

type OutsideListener = {
	node: HTMLElement;
	date: Date;
	props?: OutsideListenerProps;
};

type OutsideListenerProps = {
	callback: CallableFunction;
	modal?: boolean;
	parent?: () => HTMLElement;
};

// true if another listener whose anchor lives inside node now contains the
// click (a nested popup opened from here owns the click) — keep node open
function isAncestorOfOther(
	node: HTMLElement,
	target: HTMLElement,
	index: number
) {
	for (let i = 0; i < outsideListeners.length; i++) {
		if (i === index) continue;
		const other = outsideListeners[i];
		const p = other.props.parent?.();
		if (p && node.contains(p) && other.node.contains(target)) return true;
	}
	return false;
}

let activationDate: Date = new Date();
let skipNext = false;

let outsideHandlers: RemoveEventListener[] = [];
const outsideListeners: OutsideListener[] = [];
const handleOutsideClick: EventListener = (event: Event) => {
	// Activation was inside the elements, ignoring.
	// target.isConnected is false when popup is closed,
	// and its obj in outsideListeners removed
	const target = event.target as HTMLElement;
	if (skipNext || !target.isConnected) {
		skipNext = false;
		return;
	}

	// for each area check if event was outside the element
	for (let i = outsideListeners.length - 1; i >= 0; i--) {
		// if event was already handled, we can skip the rest
		// it is used by menu and alike, where we want to close only one
		//if (event.defaultPrevented) return;

		const { node, date, props } = outsideListeners[i];
		// if element was opened after click event - ignore it
		if (date > activationDate) continue;

		if (!node.contains(target) && node !== target) {
			// a nested popup opened from here owns this click — keep node open
			if (isAncestorOfOther(node, target, i)) break;

			if (props.callback) props.callback(event);
			// in case of modal we want to close only one
			// also we want to close only one if event was already handled
			if (props.modal || event.defaultPrevented) break;
		}
	}
};

// we are tracking mousedown for two reasons:
// 1. to be sure that mouse action was started inside the element
// 2. to ignore click event that was issued before new listener was added
// this is important for popups, because they are usually added after click event,
// and we don't want to close them immediately
const handleMouseDown: EventListener = (event: Event) => {
	activationDate = new Date();
	skipNext = true;

	for (let i = outsideListeners.length - 1; i >= 0; i--) {
		const { node } = outsideListeners[i];
		if (!node.contains(event.target as Node) && node !== event.target) {
			// activation outside the elements
			skipNext = false;
			break;
		}
	}
};

export function clickOutside(
	node: HTMLElement,
	props: CallableFunction | OutsideListenerProps
): ActionReturn {
	// set handler only once
	if (!outsideHandlers.length) {
		outsideHandlers = [
			env.addGlobalEvent("click", handleOutsideClick, node),
			env.addGlobalEvent("contextmenu", handleOutsideClick, node),
			env.addGlobalEvent("mousedown", handleMouseDown, node),
		];
	}

	if (typeof props !== "object") {
		props = { callback: props };
	}
	const pack = { node, date: new Date(), props };
	outsideListeners.push(pack);

	return {
		destroy() {
			remove(outsideListeners, pack);
			if (!outsideListeners.length) {
				outsideHandlers.forEach(e => e());
				outsideHandlers = [];
			}
		},
	};
}
