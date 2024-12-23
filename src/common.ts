export type ActionReturn = void | {
    destroy: () => void;
};

let id = new Date().valueOf();

export function uid(): number {
	id += 1;
	return id;
}
