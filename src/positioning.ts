import { env } from "./env";

type positionResult = {
	x: number;
	y: number;
	z: number;
	width: string;
};

export type TPosition =
	| "point"
	| "bottom"
	| "top"
	| "left"
	| "right"
	| "center"
	| "bottom-fit"
	| "top-fit"
	| "center-fit"
	| "bottom-right"
	| "bottom-left"
	| "bottom-start"
	| "bottom-center"
	| "bottom-end"
	| "top-right"
	| "top-left"
	| "top-start"
	| "top-center"
	| "top-end"
	| "left-start"
	| "left-center"
	| "left-end"
	| "right-start"
	| "right-center"
	| "right-end";

const isBottom = (mode: string) => mode.indexOf("bottom") !== -1;
const isLeft = (mode: string) => mode.indexOf("left") !== -1;
const isRight = (mode: string) => mode.indexOf("right") !== -1;
const isTop = (mode: string) => mode.indexOf("top") !== -1;
const isFit = (mode: string) => mode.indexOf("fit") !== -1;
const isOverlap = (mode: string) => mode.indexOf("overlap") !== -1;
const isCenter = (mode: string) => {
	return mode.split("-").every(v => ["center", "fit"].indexOf(v) > -1);
};
const getAlign = (mode: string) => {
	const match = mode.match(/(start|center|end)/);
	return match ? match[0] : null;
};

function getMaxIndex(p: HTMLElement, ap: HTMLElement): number {
	let zi = 0;
	const top = env.getTopNode(p);

	while (p) {
		if (p === top) break;
		const pos = getComputedStyle(p)["position"];
		if (pos === "absolute" || pos === "relative" || pos === "fixed") {
			zi = parseInt(getComputedStyle(p)["zIndex"]) || 0;
		}
		p = p.parentNode as HTMLElement;
		if (p === ap) break;
	}

	return zi;
}

let x: number,
	y: number,
	width: string,
	pos: {
		left: number;
		right: number;
		top: number;
		bottom: number;
		width?: number;
		height?: number;
	};

export function calculatePosition(
	self: HTMLElement,
	parent: HTMLElement,
	at: TPosition = "bottom",
	left: number = 0,
	top: number = 0
): positionResult {
	if (!self) return null;

	x = left;
	y = top;
	width = "auto";
	let z = 0;
	let fixLeft = 0;

	const body = getAbsParent(self);
	const cont = isOverlap(at) ? env.getTopNode(self) : body;

	if (!body) return null;

	const bodyRect = body.getBoundingClientRect();
	const selfRect = self.getBoundingClientRect();
	const contRect = cont.getBoundingClientRect();

	const contStyle = window.getComputedStyle(cont);
	const border: { [key: string]: number } = {
		left: 0,
		top: 0,
		bottom: 0,
		right: 0,
	};
	for (const key in border) {
		const style = `border-${key}-width`;
		border[key] = parseFloat(contStyle.getPropertyValue(style));
	}

	// correct z-index
	if (parent) {
		const zi = getMaxIndex(parent, body);
		z = Math.max(zi + 1, 20);
	}

	// set position
	if (parent) {
		pos = parent.getBoundingClientRect();
		if (isFit(at)) width = pos.width + "px";
		if (at !== "point") {
			if (isCenter(at)) {
				if (isFit(at)) {
					x = 0;
				} else {
					x = contRect.width / 2;
					fixLeft = 1;
				}
				y = (contRect.height - selfRect.height) / 2;
			} else {
				const fix = isOverlap(at) ? 0 : 1;
				x = isRight(at) ? pos.right + fix : pos.left - fix;
				y = isBottom(at) ? pos.bottom + 1 : pos.top;
				// correct x|y depending on align
				const align = getAlign(at);
				if (align) {
					if (isRight(at) || isLeft(at)) {
						if (align === "center") y -= (selfRect.height - pos.height) / 2;
						else if (align === "end") y -= selfRect.height - pos.height;
					} else if (isBottom(at) || isTop(at)) {
						if (align === "center") x -= (selfRect.width - pos.width) / 2;
						else if (align === "end") x -= selfRect.width - pos.width;
						if (!isOverlap(at)) x += 1;
					}
				}
			}
		}
	} else pos = { left: left, right: left, top: top, bottom: top };

	const isCorner = (isLeft(at) || isRight(at)) && (isBottom(at) || isTop(at));

	/* horizontal positioning */

	if (isLeft(at)) {
		fixLeft = 2;
	}

	const dxL = x - selfRect.width - contRect.left;

	if (parent && isLeft(at) && !isCorner && dxL < 0) {
		// swap to right if "left" / "left-[align]" does not fit
		x = pos.right;
		fixLeft = 0;
	}

	const dxR = x + selfRect.width * (1 - fixLeft / 2) - contRect.right;

	if (dxR > 0) {
		if (!isRight(at)) {
			x = contRect.right - border.right - selfRect.width;
		} else {
			const dx = pos.left - contRect.x - selfRect.width;
			if (parent && !isOverlap(at) && !isCorner && dx >= 0) {
				// change position to "left"
				x = pos.left - selfRect.width;
			} else {
				x -= dxR + border.right;
			}
		}
	}

	if (fixLeft) {
		// apply "left" / "center" position
		x = Math.round(x - (selfRect.width * fixLeft) / 2);
	}

	/* vertical positioning*/

	const needSwap = dxL < 0 || dxR > 0 || !isCorner;

	if (isTop(at)) {
		y = pos.top - selfRect.height;
		if (parent && y < contRect.y && needSwap) {
			// change position to "bottom"
			y = pos.bottom;
		}
	}

	const dy = y + selfRect.height - contRect.bottom;

	if (dy > 0) {
		if (parent && isBottom(at) && needSwap) {
			// change position to "top"
			y -= selfRect.height + pos.height + 1;
		} else {
			y -= dy + border.bottom;
		}
	}

	x -= bodyRect.left + border.left;
	y -= bodyRect.top + border.top;
	x = Math.max(x, 0) + cont.scrollLeft;
	y = Math.max(y, 0) + cont.scrollTop;
	width = width || "auto";

	return { x, y, z, width };
}

export function getAbsParent(el: HTMLElement): HTMLElement | null {
	const top = env.getTopNode(el);
	if (el) el = el.parentElement;
	while (el) {
		const pos = getComputedStyle(el)["position"];
		if (
			el === top ||
			pos === "relative" ||
			pos === "absolute" ||
			pos === "fixed"
		)
			return el;

		el = el.parentNode as HTMLElement;
	}
	return null;
}
