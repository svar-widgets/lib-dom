type countCallback = (count: () => void) => void;
export const resolveCount = (
	count: number,
	fn: countCallback
): Promise<unknown> => {
	let done: (value: unknown) => void;
	const p = new Promise(resolve => {
		done = resolve;
	});
	const setCount = () => {
		count--;
		if (count === 0) {
			done(count);
		}
	};

	fn(setCount);
	return p;
};

export const mouse = (name: string, element: HTMLElement): void => {
	const ev = new MouseEvent(name, {
		bubbles: true,
		cancelable: true,
	});

	element.dispatchEvent(ev);
};
