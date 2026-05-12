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

// prettier-ignore
test("should correctly calculate position at point", () => {
	const cases = [
		["bottom", null, 100, 200, { at: "bottom", x: 100, y: 200, z: 0, width: "auto" }],
		["bottom", null, 950, 200, { at: "bottom", x: 950, y: 200, z: 0, width: "auto" }],
		["bottom", null, 100, 950, { at: "bottom", x: 100, y: 950, z: 0, width: "auto" }],
	];

	cases.forEach(([at, parent, left, top, expected], i) => {
		const result = calculatePosition(child, parent, at, left, top);
		expect(result, `#${i}`).toEqual(expected);
	});
});

// prettier-ignore
test("should correctly calculate position related to parent", () => {
	const testCases = [
		["bottom", parent, { at: "bottom", x: 399, y: 551, z: 20, width: "auto" }],
		["top", parent, { at: "top", x: 399, y: 300, z: 20, width: "auto" }],
		["left", parent, { at: "left", x: 299, y: 400, z: 20, width: "auto" }],
		["right", parent, { at: "right", x: 551, y: 400, z: 20, width: "auto" }],

		["right-overlap", parent, { at: "right-overlap", x: 550, y: 400, z: 20, width: "auto" }],

		["bottom-right", parent, { at: "bottom-right", x: 551, y: 551, z: 20, width: "auto" }],
		["bottom-left", parent, { at: "bottom-left", x: 299, y: 551, z: 20, width: "auto" }],
		["top-right", parent, { at: "top-right", x: 551, y: 300, z: 20, width: "auto" }],
		["top-left", parent, { at: "top-left", x: 299, y: 300, z: 20, width: "auto" }],

		["bottom-fit", parent, { at: "bottom-fit", x: 399, y: 551, z: 20, width: "150px" }],
		["top-fit", parent, { at: "top-fit", x: 399, y: 300, z: 20, width: "150px" }],

		["center", container, { at: "center", x: 650, y: 650, z: 20, width: "auto" }],
		["center-fit", container, { at: "center-fit", x: 0, y: 650, z: 20, width: "1400px" }],

		["left-start", parent, { at: "left-start", x: 299, y: 400, z: 20, width: "auto" }],
		["left-center", parent, { at: "left-center", x: 299, y: 425, z: 20, width: "auto" }],
		["left-end", parent, { at: "left-end", x: 299, y: 450, z: 20, width: "auto" }],

		["right-start", parent, { at: "right-start", x: 551, y: 400, z: 20, width: "auto" }],
		["right-center", parent, { at: "right-center", x: 551, y: 425, z: 20, width: "auto" }],
		["right-end", parent, { at: "right-end", x: 551, y: 450, z: 20, width: "auto" }],

		["top-start", parent, { at: "top-start", x: 400, y: 300, z: 20, width: "auto" }],
		["top-center", parent, { at: "top-center", x: 425, y: 300, z: 20, width: "auto" }],
		["top-end", parent, { at: "top-end", x: 450, y: 300, z: 20, width: "auto" }],

		["bottom-start", parent, { at: "bottom-start", x: 400, y: 551, z: 20, width: "auto" }],
		["bottom-center", parent, { at: "bottom-center", x: 425, y: 551, z: 20, width: "auto" }],
		["bottom-end", parent, { at: "bottom-end", x: 450, y: 551, z: 20, width: "auto" }],
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
	const expected = { at: "point", x: 200, y: 240, z: 20, width: "auto" };
	const result = calculatePosition(portal, parent, "point", left, top);
	expect(result).toEqual(expected);
});

// prettier-ignore
test("should change 'at' position when there is not enough space between parent and container", () => {
	document.body.style = "margin: 0; padding: 0;";
	const style = "padding-top: 200px; padding-left: 200px; box-sizing: border-box;";
	document.body.innerHTML = `
	    <div id="container" style="position: relative; width: 710px; height: 500px; ${style}">
	    	<div id="parentCont" style="position: relative; width: 300px; height: 300px;">
	    		<div id="parent" style="width: 200px; height: 50px; "></div>
				</div>
				<div id="popup" style="position: absolute; width: 100px; height: 100px;"></div>
			</div>
	`;
	const popup = document.getElementById("popup");
	const parent = document.getElementById("parent");
	const parentCont = document.getElementById("parentCont");

	const testCases = [
		["top", { x: 200, y: -200 }, { at: "bottom", x: 399, y: 50, z: 20, width: "auto" }],
		["top-right", { x: 200, y: -200 }, { at: "top-right", x: 601, y: 0, z: 20, width: "auto" }],
		["top-left", { x: 200, y: -200 }, { at: "top-left", x: 299, y: 0, z: 20, width: "auto" }],
		["top-right", { x: 250, y: -200 }, { at: "bottom-right", x: 610, y: 50, z: 20, width: "auto" }],
		["top-left", { x: -200, y: -200 }, { at: "bottom-left", x: 0, y: 50, z: 20, width: "auto" }],
		["top-end", { x: -200, y: -200 }, { at: "bottom-end", x: 100, y: 50, z: 20, width: "auto" }],
		["top-center", { x: -200, y: -200 }, { at: "bottom-center", x: 50, y: 50, z: 20, width: "auto" }],
		["left-end", { x: -200, y: -200 }, { at: "right-end", x: 200, y: 0, z: 20, width: "auto" }],
		["left-end", { x: 250, y: -200 }, { at: "left-end", x: 349, y: 0, z: 20, width: "auto" }],
		["right-end", { x: 250, y: -200 }, { at: "left-end", x: 350, y: 0, z: 20, width: "auto" }],

		["right-overlap", { x: 600, y: -200 }, { at: "left-overlap", x: 700, y: 0, z: 20, width: "auto" }],

		["bottom", { x: 200, y: 200 }, { at: "top", x: 399, y: 300, z: 20, width: "auto" }],
		["bottom-start", { x: 200, y: 200 }, { at: "top-start", x: 400, y: 300, z: 20, width: "auto" }],
		["right-start", { x: 250, y: 250 }, { at: "left-start", x: 350, y: 400, z: 20, width: "auto" }],
		["bottom", { x: -200, y: 200 }, { at: "top", x: 0, y: 300, z: 20, width: "auto" }],
		["bottom-left", { x: -200, y: 200 }, { at: "top-left", x: 0, y: 300, z: 20, width: "auto" }],
		["left-start", { x: -200, y: 250 }, { at: "right-start", x: 200, y: 400, z: 20, width: "auto" }],
		["left-bottom", { x: -99, y: 250 }, { at: "left-bottom", x: 0, y: 400, z: 20, width: "auto" }],
		["left-bottom", { x: -150, y: 250 }, { at: "left-top", x: 0, y: 350, z: 20, width: "auto" }],
		["right-bottom", { x: 150, y: 250 }, { at: "right-bottom", x: 551, y: 400, z: 20, width: "auto" }],
		["right-bottom", { x: 250, y: 250 }, { at: "right-top", x: 610, y: 350, z: 20, width: "auto" }],
	];

	testCases.forEach(([at, offset, expected], i) => {
		parentCont.style.left = offset.x + "px";
		parentCont.style.top = offset.y + "px";
		const result = calculatePosition(popup, parent, at);
		expect(result, `#${i} ${at}`).toEqual(expected);
	});
});

// prettier-ignore
test("should correctly apply 'at' position when container styles contain borders", () => {
	document.body.style = "margin: 0; padding: 0;";
	const style = "box-sizing: border-box; border: 10px solid #eee;";
	document.body.innerHTML = `
	    <div id="container" style="position: relative; width: 500px; height: 500px; ${style}">
	    	<div id="parentCont" style="position: relative; width: 300px; height: 300px;">
	    		<div id="parent" style="width: 200px; height: 50px; "></div>
				</div>
				<div id="popup" style="position: absolute; width: 100px; height: 100px;"></div>
			</div>
	`;
	const popup = document.getElementById("popup");
	const parent = document.getElementById("parent");
	const parentCont = document.getElementById("parentCont");

	const testCases = [
		["bottom-right", { x: 200, y: 200 }, { at: "bottom-right", x: 380, y: 251, z: 20, width: "auto" }],
		["bottom-right", { x: 150, y: 340 }, { at: "bottom-right", x: 351, y: 380, z: 20, width: "auto" }],
	];

	testCases.forEach(([at, offset, expected], i) => {
		parentCont.style.left = offset.x + "px";
		parentCont.style.top = offset.y + "px";
		const result = calculatePosition(popup, parent, at);
		expect(result, `#${i} ${at}`).toEqual(expected);
	});
});
