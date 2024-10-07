export function remove<T>(items: T[], node: T): void {
	for (let i = items.length - 1; i >= 0; i--) {
		if (items[i] === node) {
			items.splice(i, 1);
			break;
		}
	}
}
