import { expect, test, beforeAll } from "vitest";
import { locateID } from "../src/index";

// @vitest-environment jsdom

beforeAll(() => {
	document.body.innerHTML = `
        <div data-id="1">One</div>
        <div data-id="2">Two</div>
        <div data-id="3">
            <div id="in3"></div>
        </div>
        <div data-id="str3">
            <div id="in3str"></div>
        </div>
    `;
});

test("ID by node", () => {
	expect(locateID(document.getElementById("in3"))).to.eq(3);
	expect(locateID(document.getElementById("in3str"))).to.eq("str3");
});
