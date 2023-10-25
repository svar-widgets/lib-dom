export function clickOutside(node: HTMLElement, callback: CallableFunction) {
	const events = ["click", "contextmenu"];
	const handleClick: EventListener = (event: Event) => {
		if (
			node &&
			!node.contains(event.target as Node) &&
			!event.defaultPrevented
		) {
			callback(event);
		}
	};

	events.forEach(e => document.addEventListener(e, handleClick, true));
	return {
		destroy() {
			events.forEach(e => document.removeEventListener(e, handleClick, true));
		},
	};
}
