import { env } from "./env";

type positionResult = {
	x: number;
	y: number;
	z: number;
	width: string;
};

type positionString = string;

const isBottom = (mode: string) => mode.indexOf("bottom") !== -1;
const isLeft = (mode: string) => mode.indexOf("left") !== -1;
const isRight = (mode: string) => mode.indexOf("right") !== -1;
const isTop = (mode: string) => mode.indexOf("top") !== -1;
const isFit = (mode: string) => mode.indexOf("fit") !== -1;
const isOverlap = (mode: string) => mode.indexOf("overlap") !== -1;
const isCenter = (mode: string) => mode.indexOf("center") !== -1;

function getMaxIndex(p: HTMLElement, ap: HTMLElement): number {
	let zi = 0;
	const top = env.getTopNode();

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
	};

const noPosition = { x: 0, y: 0, z: 0, width: "auto" };

export function calculatePosition(
	self: HTMLElement,
	parent: HTMLElement,
	at: positionString = "bottom",
	left: number = 0,
	top: number = 0
): positionResult {
	if (!self) return noPosition;

	x = left;
	y = top;
	let z = 0;
	let fixLeft = 0;

	const body = getAbsParent(self);
	const cont = isOverlap(at) ? env.getTopNode() : body;

	if (!body) return noPosition;

	const bodyRect = body.getBoundingClientRect();
	const selfRect = self.getBoundingClientRect();
	const contRect = cont.getBoundingClientRect();

	// correct z-index
	if (parent) {
		const zi = getMaxIndex(parent, body);
		z = Math.max(zi + 1, 20);
	}

	// set position
	if (parent) {
		pos = parent.getBoundingClientRect();
		width = isFit(at) ? pos.width + "px" : "auto";
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
			}
		}
	} else pos = { left: left, right: left, top: top, bottom: top };

	if (isLeft(at)) {
		x = pos.left;
		fixLeft = 2;
	}
	if (isTop(at)) {
		y = pos.top - selfRect.height;
	}

	/*
  [FIXME]
  we can use a bit more clever logic here
  when "bottom" strategy fails, use "top"
  and only when both fails, then "fit over" the action area

  similar to right/left
  it must be appliend only for "at" axis
  second axis, will always use "fit over" 
*/

	const dy = y + selfRect.height - contRect.bottom;
	if (dy > 0) y -= dy;

	const dxR = x + selfRect.width - contRect.right;
	if (dxR > 0) {
		if (!isRight(at)) {
			x = pos.right - selfRect.width;
		} else {
			fixLeft = 2;
		}
	}

	// correct left position
	// can't do it earlier, because width of menu is unknown
	if (fixLeft) x = Math.round(x - (selfRect.width * fixLeft) / 2);

	if (x < 0) {
		if (at !== "left") {
			x = 0;
		} else {
			x = pos.right;
		}
	}

	x += cont.scrollLeft - bodyRect.left;
	y += cont.scrollTop - bodyRect.top;
	width = width || "auto";

	return { x, y, z, width };
}

export function getAbsParent(el: HTMLElement): HTMLElement | null {
	const top = env.getTopNode();
	while (el) {
		el = el.parentNode as HTMLElement;
		const pos = getComputedStyle(el)["position"];
		if (
			el === top ||
			pos === "relative" ||
			pos === "absolute" ||
			pos === "fixed"
		)
			return el;
	}
	return null;
}
