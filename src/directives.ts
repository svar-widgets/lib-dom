export type OnMoveConfig = {
	hoverDelay?: number;
	hideDelay?: number;
};

export function onhover<T extends { id: string | number }>(
	node: HTMLElement,
	[locate, callback]: [CallableFunction, CallableFunction]
): { destroy: () => void } {
	return onmove<T>(node, [locate, callback, { hoverDelay: 500 }]);
}

export function onmove<T extends { id: string | number }>(
	node: HTMLElement,
	[locate, callback, cfg]: [CallableFunction, CallableFunction, OnMoveConfig?]
): { destroy: () => void } {
	let lastId: string | number | null = null;

	function over(ev: Event) {
		const data = locate(ev);
		if (data) {
			show(ev, data);
		} else if (lastId !== null) {
			hide(ev);
		}
	}

	function leave(ev: Event) {
		if (lastId !== null) {
			hide(ev);
		}
	}

	let hideTimeout: ReturnType<typeof setTimeout> | null = null;
	let showTimeout: ReturnType<typeof setTimeout> | null = null;
	let lastData: T | null = null;
	let lastEv: Event | null = null;

	function hide(ev: Event) {
		if (showTimeout) {
			clearTimeout(showTimeout);
			lastData = lastEv = showTimeout = null;
		}
		if (cfg?.hoverDelay) {
			callback(null, ev);
			lastId = null;
			return;
		}

		if (!hideTimeout) {
			hideTimeout = setTimeout(() => {
				hideTimeout = null;
				callback(null, ev);
				lastId = null;
			}, cfg?.hideDelay ?? 250);
		}
	}

	function show(ev: Event, data: T) {
		if (hideTimeout) {
			clearTimeout(hideTimeout);
			hideTimeout = null;
		}
		if (cfg?.hoverDelay && lastId !== data.id) {
			if (showTimeout && lastData?.id === data.id) {
				lastEv = ev;
				return;
			}

			if (showTimeout) clearTimeout(showTimeout);
			if (lastId) hide(ev);

			lastData = data;
			lastEv = ev;
			showTimeout = setTimeout(() => {
				showTimeout = null;
				callback(lastData, lastEv);
				lastId = data.id;
			}, cfg.hoverDelay);
		} else {
			callback(data, ev);
			lastId = data.id;
		}
	}

	node.addEventListener("mousemove", over);
	node.addEventListener("mouseleave", leave);

	return {
		destroy() {
			node.removeEventListener("mousemove", over);
			node.removeEventListener("mouseleave", leave);
		},
	};
}
