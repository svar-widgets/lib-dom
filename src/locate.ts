export function locate(el: Element | Event, attr = "data-id"): HTMLElement {
	let node = el as HTMLElement;
	if (!node.tagName && (el as Event).target)
		node = (el as Event).target as HTMLElement;

	while (node) {
		if (node.getAttribute) {
			const id = node.getAttribute(attr);
			if (id) return node;
		}

		node = node.parentNode as HTMLElement;
	}

	return null;
}
export function locateAttr(el: Element | Event, attr = "data-id"): string {
	const node = locate(el, attr);
	if (node) return node.getAttribute(attr);

	return null;
}

export function locateID(
	el: Element | Event,
	attr = "data-id"
): string | number {
	const node = locate(el, attr);

	if (node) {
		return getID(node, attr);
	}

	return null;
}

export function getID(el: Element, attr = "data-id"): string | number {
	const value = el.getAttribute(attr);
	if (!value) return null;

	return id(value);
}

export function locateNode(el: Element, node: Element): boolean {
	let n = el;
	while (n) {
		if (n === node) {
			return true;
		}
		n = n?.parentNode as Element;
	}

	return null;
}

export function setID(id: string | number): string | number {
	return typeof id === "string" ? ":" + id : id;
}

function id(value: string): string | number {
	if (value.startsWith(":")) return value.substring(1);
	const t = (value as undefined as number) * 1;
	if (!isNaN(t)) return t;

	return value;
}
