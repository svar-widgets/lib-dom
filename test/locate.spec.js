import { expect, test, beforeAll } from "vitest";
import { locateAttr, locateID, getID, setID } from "../src/index";

// @vitest-environment jsdom

beforeAll(() => {
	document.body.innerHTML = `
        <div data-id=${setID(1)}>One</div>
        <div data-id=${setID("2")}>Two</div>
        <div data-id=${setID(3)}>
            <div id="in3"></div>
        </div>
        <div data-id=${setID("str3")}>
            <div id="in3str"></div>
        </div>
    `;
});

test("attribute by locate node", () => {
	expect(locateAttr(document.getElementById("in3"))).to.eq("3");
	expect(locateAttr(document.getElementById("in3str"))).to.eq(":str3");
});

test("id by locate node", () => {
	expect(locateID(document.getElementById("in3"))).to.eq(3);
	expect(locateID(document.getElementById("in3str"))).to.eq("str3");
});

test("id by node", () => {
	expect(getID(document.querySelector(`[data-id="${setID(1)}"]`))).to.eq(1);
	expect(getID(document.querySelector(`[data-id="${setID("2")}"]`))).to.eq("2");
});
