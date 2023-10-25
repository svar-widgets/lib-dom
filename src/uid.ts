let id = new Date().valueOf();

export function uid(): number {
	id += 1;
	return id;
}
