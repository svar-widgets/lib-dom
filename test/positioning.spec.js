import { expect, test, beforeAll } from "vitest";
import { calculatePosition, getAbsParent } from "../src/index";

let container, parent, child;

beforeAll(() => {
	document.body.style = "margin: 0; padding: 0;";
	document.body.innerHTML = `
	    <div id="container" style="position: relative; width: 1000px; height: 1000px; padding-top: 400px; padding-left: 400px;">
	        <div id="parent" style="width: 150px; height: 150px;">
	            <div id="child" style="width: 100px; height: 100px; position: absolute;"></div>
	        </div>
	    </div>
	`;
	container = document.getElementById("container");
	parent = document.getElementById("parent");
	child = document.getElementById("child");
});

test("getAbsParent should return the correct parent", () => {
	expect(getAbsParent(child)).toBe(container);
	expect(getAbsParent(parent)).toBe(container);
	expect(getAbsParent(container)).toBe(document.body);
});

test("should correctly calculate position at point", () => {
	const cases = [
		["bottom", null, 100, 200, { x: 100, y: 200, z: 0, width: "auto" }],
		["bottom", null, 950, 200, { x: 950, y: 200, z: 0, width: "auto" }],
		["bottom", null, 100, 950, { x: 100, y: 950, z: 0, width: "auto" }],
	];

	cases.forEach(([at, parent, left, top, expected], i) => {
		const result = calculatePosition(child, parent, at, left, top);
		expect(result, `#${i}`).toEqual(expected);
	});
});

test("should correctly calculate position related to parent", () => {
	const testCases = [
		["bottom", parent, { x: 399, y: 551, z: 20, width: "auto" }],
		["top", parent, { x: 399, y: 300, z: 20, width: "auto" }],
		["left", parent, { x: 300, y: 400, z: 20, width: "auto" }],
		["right", parent, { x: 551, y: 400, z: 20, width: "auto" }],
		["bottom-right", parent, { x: 551, y: 551, z: 20, width: "auto" }],
		["bottom-left", parent, { x: 300, y: 551, z: 20, width: "auto" }],
		["top-right", parent, { x: 551, y: 300, z: 20, width: "auto" }],
		["top-left", parent, { x: 300, y: 300, z: 20, width: "auto" }],

		["bottom-fit", parent, { x: 399, y: 551, z: 20, width: "150px" }],
		["top-fit", parent, { x: 399, y: 300, z: 20, width: "150px" }],

		["center", container, { x: 650, y: 650, z: 20, width: "auto" }],
		["center-fit", container, { x: 0, y: 650, z: 20, width: "1400px" }],
	];

	testCases.forEach(([at, parent, expected], i) => {
		const result = calculatePosition(child, parent, at);
		expect(result, `#${i} ${at}`).toEqual(expected);
	});
});
test("should correctly calculate position at point if parent is bigger than container", () => {
	document.body.style = "margin: 0; padding: 0; width: 300px; height: 500px;";
	document.body.innerHTML = `
	    <div style="position: relative; width: 300px; height: 500px;">
	        <div style="width: 250px; height: 250px;overflow:auto;">
	    			<div id="parent" style="width: 500px; height: 500px;"></div>
	        </div>
	        <div id="portal" style="position: absolute; width: 100px; height: 100px;"></div>
	    </div>
	`;
	const portal = document.getElementById("portal");
	const parent = document.getElementById("parent");

	const left = 240;
	const top = 240;
	const expected = { x: 200, y: 240, z: 20, width: "auto" };
	const result = calculatePosition(portal, parent, "point", left, top);
	expect(result).toEqual(expected);
});
