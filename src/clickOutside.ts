import { remove } from "./array";
import type { ActionReturn } from "./common";

type OutsideListener = {
	node: HTMLElement;
	date: Date;
	props?: OutsideListenerProps;
};

type OutsideListenerProps = {
	callback: CallableFunction;
	modal?: boolean;
};

let activationDate: Date = new Date();
let skipNext = false;

const outsideListners: OutsideListener[] = [];
const handleOutsideClick: EventListener = (event: Event) => {
	// activation was inside of the elements, ignoring
	if (skipNext) {
		skipNext = false;
		return;
	}

	// for each area check if event was outside of the element
	for (let i = outsideListners.length - 1; i >= 0; i--) {
		// if event was already handled, we can skip the rest
		// it is used by menu and alike, where we want to close only one
		//if (event.defaultPrevented) return;

		const { node, date, props } = outsideListners[i];
		// if element was opened after click event - ignore it
		if (date > activationDate) continue;

		if (!node.contains(event.target as Node) && node !== event.target) {
			if (props.callback) props.callback(event);
			// in case of modal we want to close only one
			// also we want to close only one if event was already handled
			if (props.modal || event.defaultPrevented) break;
		}
	}
};
const outsideEvents = ["click", "contextmenu"];

// we are tracking mousedown for two reasons:
// 1. to be sure that mouse action was started inside the element
// 2. to ignore click event that was issued before new listener was added
// this is important for popups, because they are usually added after click event
// and we don't want to close them immediately
const handleMouseDown: EventListener = (event: Event) => {
	activationDate = new Date();
	skipNext = true;

	for (let i = outsideListners.length - 1; i >= 0; i--) {
		const { node } = outsideListners[i];
		if (!node.contains(event.target as Node) && node !== event.target) {
			// activation outside of the elements
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
	if (!outsideListners.length) {
		outsideEvents.forEach(e =>
			document.addEventListener(e, handleOutsideClick)
		);
		document.addEventListener("mousedown", handleMouseDown);
	}

	if (typeof props !== "object") {
		props = { callback: props };
	}
	const pack = { node, date: new Date(), props };
	outsideListners.push(pack);

	return {
		destroy() {
			remove(outsideListners, pack);
			if (!outsideListners.length)
				outsideEvents.forEach(e =>
					document.removeEventListener(e, handleOutsideClick)
				);
		},
	};
}
