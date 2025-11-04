type Handler = (ev?: KeyboardEvent, keys?: { key: string, evKey: string }) => void;

class ScreenKeys {
	store: Map<string, Handler>;
	node: Node;
	constructor() {
		this.store = new Map();
	}

	configure(hotkeys: { [key: string]: Handler | false }, node: Node) {
		this.node = node;
		for (const hotkey in hotkeys) {
			if (hotkeys[hotkey]) {
				const hotkeyFormatted = hotkey.toLowerCase().replace(/[ ]/g, "");
				const handler = hotkeys[hotkey];
				this.store.set(hotkeyFormatted, handler);
			}
		}
	}
}

const chain: ScreenKeys[] = [];
export const hotkeys = {
	subscribe: (v: (t: ScreenKeys) => void) => {
		init_once();

		const t = new ScreenKeys();
		chain.push(t);
		v(t);

		return () => {
			const ind = chain.findIndex(a => a === t);
			if (ind >= 0) chain.splice(ind, 1);
		};
	},
};

var ready = false;
function init_once() {
	if (ready) return;
	ready = true;

	document.addEventListener("keydown", ev => {
		if (
			chain.length &&
			(ev.ctrlKey ||
				ev.altKey ||
				ev.metaKey ||
				ev.shiftKey ||
				ev.key.length > 1 ||
				ev.key === " ")
		) {
			const code = [];
			if (ev.ctrlKey) code.push("ctrl");
			if (ev.altKey) code.push("alt");
			if (ev.metaKey) code.push("meta");
			if (ev.shiftKey) code.push("shift");
			let evKey = ev.code.replace("Key", "").toLocaleLowerCase();
			if (ev.key === " ") {
				evKey = "space";
			}
			code.push(evKey);

			const key = code.join("+");

			for (let i = chain.length - 1; i >= 0; i--) {
				const target = chain[i];
				const handler =
					target.store.get(key) || target.store.get(evKey);
				if (handler && target.node.contains(ev.target as Node)) {
					handler(ev, { key, evKey });
				}
			}
		}
	});
}
