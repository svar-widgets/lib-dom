import { expect, test, beforeEach } from "vitest";
import { locateArea } from "../src/locate";
import { setID } from "../src/index";
import { mouse } from "./utils";

// @vitest-environment jsdom

// two sections ("left"/"right"), list items marked with data-id,
// each item may contain an optional action area ("action")
const areas = ["left", "right"];
const parts = ["action"];

beforeEach(() => {
	document.body.innerHTML = `
        <div id="host">
            <div class="left">
                <div data-id=${setID("a1")}>
                    <div class="action">
                        <span id="leftIcon">icon</span>
                    </div>
                    <span id="leftText">Item A1</span>
                </div>
                <div data-id=${setID(2)} id="leftItem2">Item A2</div>
            </div>
            <div class="right">
                <div data-id=${setID("b1")} id="rightItem">
                    <div class="action" id="rightAction">
                        <span id="rightIcon">icon</span>
                    </div>
                </div>
            </div>
            <div id="outside">outside any section</div>
        </div>
    `;
});

test("locates item, area and part from a nested icon", () => {
	const [item, area, part] = locateArea(
		document.getElementById("leftIcon"),
		areas,
		parts
	);
	expect(item.getAttribute("data-id")).to.eq(":a1");
	expect(area).to.eq("left");
	expect(part).to.eq("action");
});

test("locates item and area, no part when target is outside the action area", () => {
	const [item, area, part] = locateArea(
		document.getElementById("leftText"),
		areas,
		parts
	);
	expect(item.getAttribute("data-id")).to.eq(":a1");
	expect(area).to.eq("left");
	expect(part).to.eq("");
});

test("locates item when the item node itself is the target", () => {
	const [item, area, part] = locateArea(
		document.getElementById("leftItem2"),
		areas,
		parts
	);
	expect(item.getAttribute("data-id")).to.eq("2");
	expect(area).to.eq("left");
	expect(part).to.eq("");
});

test("identifies the right section", () => {
	const [item, area, part] = locateArea(
		document.getElementById("rightIcon"),
		areas,
		parts
	);
	expect(item.getAttribute("data-id")).to.eq(":b1");
	expect(area).to.eq("right");
	expect(part).to.eq("action");
});

test("returns null item when clicking the section background", () => {
	const [item, area, part] = locateArea(
		document.querySelector(".left"),
		areas,
		parts
	);
	expect(item).to.eq(null);
	expect(area).to.eq("left");
	expect(part).to.eq("");
});

test("returns empty area and null item outside any section", () => {
	const [item, area, part] = locateArea(
		document.getElementById("outside"),
		areas,
		parts
	);
	expect(item).to.eq(null);
	expect(area).to.eq("");
	expect(part).to.eq("");
});

test("ignores parts when no parts list is provided", () => {
	const [item, area, part] = locateArea(
		document.getElementById("rightIcon"),
		areas
	);
	expect(item.getAttribute("data-id")).to.eq(":b1");
	expect(area).to.eq("right");
	expect(part).to.eq("");
});

test("a part class above the item node is ignored", () => {
	// the "action" class sits on the section, above the data-id item
	document.body.innerHTML = `
        <div class="left action">
            <div data-id=${setID(5)}>
                <span id="i5icon">i</span>
            </div>
        </div>
    `;
	const [item, area, part] = locateArea(
		document.getElementById("i5icon"),
		["left"],
		["action"]
	);
	expect(item.getAttribute("data-id")).to.eq("5");
	expect(area).to.eq("left");
	expect(part).to.eq("");
});

test("when nested parts match, the one closest to the item wins", () => {
	document.body.innerHTML = `
        <div class="left">
            <div data-id=${setID("m")}>
                <div class="action">
                    <div class="handle">
                        <span id="deep">x</span>
                    </div>
                </div>
            </div>
        </div>
    `;
	const [, area, part] = locateArea(
		document.getElementById("deep"),
		["left"],
		["action", "handle"]
	);
	expect(area).to.eq("left");
	expect(part).to.eq("action");
});

test("supports a custom attribute name", () => {
	document.body.innerHTML = `
        <div class="left">
            <div data-row="7" id="custom">
                <span id="customIcon">i</span>
            </div>
        </div>
    `;
	const [item, area, part] = locateArea(
		document.getElementById("customIcon"),
		["left"],
		[],
		"data-row"
	);
	expect(item.getAttribute("data-row")).to.eq("7");
	expect(area).to.eq("left");
	expect(part).to.eq("");
});

test("resolves from an event target", () => {
	let captured;
	const host = document.getElementById("host");
	const handler = ev => {
		captured = locateArea(ev, areas, parts);
	};
	host.addEventListener("click", handler);
	mouse("click", document.getElementById("leftIcon"));
	host.removeEventListener("click", handler);

	const [item, area, part] = captured;
	expect(item.getAttribute("data-id")).to.eq(":a1");
	expect(area).to.eq("left");
	expect(part).to.eq("action");
});
