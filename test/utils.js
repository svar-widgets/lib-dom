export const resolveCount = (count, fn) => {
	let done;
	const p = new Promise(resolve => {
		done = resolve;
	});
	const setCount = () => {
		count--;
		if (count === 0) {
			done();
		}
	};

	fn(setCount);
	return p;
};

export const mouse = (name, element) => {
	const ev = new MouseEvent(name, {
		bubbles: true,
		cancelable: true,
	});

	element.dispatchEvent(ev);
};
