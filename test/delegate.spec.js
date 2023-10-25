import { expect, test, beforeEach } from "vitest";
import { delegateClick, delegateEvent } from "../src/index";
import { mouse, resolveCount } from "./utils";

// @vitest-environment jsdom

beforeEach(() => {
	document.body.innerHTML = `
        <div id="host">
            <div data-id="1">
                <div data-action="drag">
                    <div id="in1"></div>
                </div>
            </div>
            <div data-id="2">Two</div>
            <div data-id="3">
                <div id="in3"></div>
            </div>
            <div data-id="str3">
                <div data-action="drag" id="in3str"></div>
            </div>
        </div>
    `;
});

test("delegateClick handler", () => {
	const results = [];
	return resolveCount(3, done => {
		delegateClick(document.getElementById("host"), id => {
			results.push(id);
			done();
		});

		mouse("click", document.getElementById("in3"));
		mouse("click", document.getElementById("in3str"));
		mouse("click", document.querySelector('[data-id="2"]'));
		mouse("click", document.querySelector("#host"));
	}).then(() => {
		expect(results).to.deep.eq([3, "str3", 2]);
	});
});

test("delegateClick hash", () => {
	const results = [];
	return resolveCount(3, done => {
		delegateClick(document.getElementById("host"), {
			click: id => {
				results.push(id);
				done();
			},
		});

		mouse("click", document.getElementById("in3"));
		mouse("click", document.getElementById("in3str"));
		mouse("click", document.querySelector('[data-id="2"]'));
	}).then(() => {
		expect(results).to.deep.eq([3, "str3", 2]);
	});
});

test("delegateEvent handler", () => {
	const results = [];
	return resolveCount(3, done => {
		delegateEvent(
			document.getElementById("host"),
			id => {
				results.push(id);
				done();
			},
			"click"
		);

		mouse("click", document.getElementById("in3"));
		mouse("click", document.getElementById("in3str"));
		mouse("click", document.querySelector('[data-id="2"]'));
	}).then(() => {
		expect(results).to.deep.eq([3, "str3", 2]);
	});
});

test("delegateClick, dblclick handler", () => {
	const results = [];
	return resolveCount(3, done => {
		delegateClick(document.getElementById("host"), {
			dblclick: id => {
				results.push(id);
				done();
			},
		});

		mouse("dblclick", document.getElementById("in3"));
		mouse("dblclick", document.getElementById("in3str"));
		mouse("dblclick", document.querySelector('[data-id="2"]'));
	}).then(() => {
		expect(results).to.deep.eq([3, "str3", 2]);
	});
});

test("delegateEvent, by action", () => {
	const results = [];
	return resolveCount(7, done => {
		delegateClick(document.getElementById("host"), {
			drag: id => {
				results.push("d" + id);
				done();
			},
			click: id => {
				results.push("c" + id);
				done();
			},
		});

		mouse("click", document.getElementById("in3"));
		mouse("click", document.getElementById("in3str"));
		mouse("click", document.querySelector('[data-id="2"]'));
		mouse("click", document.getElementById("in3"));
		mouse("click", document.getElementById("in3str"));
		mouse("click", document.querySelector('[data-id="2"]'));
		mouse("click", document.getElementById("in1"));
	}).then(() => {
		expect(results).to.deep.eq([
			"c3",
			"dstr3",
			"c2",
			"c3",
			"dstr3",
			"c2",
			"d1",
		]);
	});
});
