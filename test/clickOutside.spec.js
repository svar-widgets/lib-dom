import { expect, test, beforeEach, afterEach } from "vitest";
import { clickOutside } from "../src/index";
import { mouse } from "./utils";

// @vitest-environment jsdom

// "outer" plays the master role (side area / editor cell) and holds the inner
// popup's anchor. The inner popup is portaled out, so in the DOM it is a
// sibling of outer, not a child — the same layout that triggered the 0.13.0
// regression where the outer listener stopped closing.
beforeEach(() => {
	document.body.innerHTML = `
		<div id="outer">
			<div id="anchor"></div>
		</div>
		<div id="inner">
			<div id="inner-child"></div>
		</div>
		<div id="elsewhere"></div>
	`;
});

let cleanup = [];
afterEach(() => {
	cleanup.forEach(destroy => destroy());
	cleanup = [];
	document.body.innerHTML = "";
});

function listen(id, props) {
	const { destroy } = clickOutside(document.getElementById(id), props);
	cleanup.push(destroy);
}

// a real click is preceded by mousedown; clickOutside tracks both
function click(id) {
	const node = document.getElementById(id);
	mouse("mousedown", node);
	mouse("click", node);
}

test("click inside the inner popup keeps the outer listener open", () => {
	let outerClosed = false;
	let innerClosed = false;
	listen("outer", { callback: () => (outerClosed = true) });
	listen("inner", {
		callback: () => (innerClosed = true),
		parent: () => document.getElementById("anchor"),
	});

	click("inner-child");

	expect(innerClosed).to.eq(false);
	expect(outerClosed).to.eq(false);
});

test("click outside both master and slave closes the outer listener", () => {
	let outerClosed = false;
	let innerClosed = false;
	listen("outer", { callback: () => (outerClosed = true) });
	listen("inner", {
		callback: () => (innerClosed = true),
		parent: () => document.getElementById("anchor"),
	});

	click("elsewhere");

	expect(innerClosed).to.eq(true);
	expect(outerClosed).to.eq(true);
});

test("a lone listener that declares a parent still closes on an outside click", () => {
	let closed = false;
	listen("inner", {
		callback: () => (closed = true),
		parent: () => document.getElementById("anchor"),
	});

	click("elsewhere");

	expect(closed).to.eq(true);
});
