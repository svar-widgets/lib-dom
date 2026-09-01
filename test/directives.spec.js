import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import { onhover, onmove } from "../src/directives";
import { locateID, setID } from "../src/index";
import { mouse } from "./utils";

// @vitest-environment jsdom

let host;

beforeEach(() => {
	document.body.innerHTML = `
        <div id="host">
            <div data-id=${setID(1)}>
                <span id="in1">One</span>
            </div>
            <div data-id=${setID(2)} id="item2">Two</div>
            <div id="empty">no id here</div>
        </div>
    `;
	host = document.getElementById("host");
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

// a locate fn in the shape the directive expects: returns an object with `id`
const locate = ev => {
	const id = locateID(ev);
	return id === null ? null : { id };
};

describe("onhover", () => {
	// onhover === onmove with { hoverDelay: 500 }: show is delayed, hide is immediate

	test("shows located data only after the hover delay", () => {
		const calls = [];
		onhover(host, [locate, (data, ev) => calls.push([data, ev.type])]);

		mouse("mousemove", document.getElementById("in1"));
		expect(calls).to.have.length(0); // nothing yet, show is delayed

		vi.advanceTimersByTime(500);
		expect(calls).to.have.length(1);
		expect(calls[0][0]).to.deep.eq({ id: 1 });
		expect(calls[0][1]).to.eq("mousemove");
	});

	test("hides immediately when leaving an item to empty space", () => {
		const calls = [];
		onhover(host, [locate, data => calls.push(data)]);

		mouse("mousemove", document.getElementById("item2"));
		vi.advanceTimersByTime(500); // item shown
		expect(calls).to.deep.eq([{ id: 2 }]);

		mouse("mousemove", document.getElementById("empty"));
		expect(calls).to.deep.eq([{ id: 2 }, null]); // hide fires at once
	});

	test("hides immediately on mouseleave after an item is shown", () => {
		const calls = [];
		onhover(host, [locate, data => calls.push(data)]);

		mouse("mousemove", document.getElementById("in1"));
		vi.advanceTimersByTime(500);
		mouse("mouseleave", host);

		expect(calls).to.deep.eq([{ id: 1 }, null]);
	});

	test("switching items hides the old at once and shows the new after the delay", () => {
		const calls = [];
		onhover(host, [locate, data => calls.push(data)]);

		mouse("mousemove", document.getElementById("in1"));
		vi.advanceTimersByTime(500);
		expect(calls).to.deep.eq([{ id: 1 }]);

		mouse("mousemove", document.getElementById("item2"));
		expect(calls).to.deep.eq([{ id: 1 }, null]); // old hidden immediately

		vi.advanceTimersByTime(500);
		expect(calls).to.deep.eq([{ id: 1 }, null, { id: 2 }]); // new after delay
	});

	test("re-fires for the same item once it is shown (no dedupe)", () => {
		const calls = [];
		onhover(host, [locate, data => calls.push(data)]);

		mouse("mousemove", document.getElementById("in1"));
		vi.advanceTimersByTime(500);
		mouse("mousemove", document.getElementById("in1"));

		expect(calls).to.deep.eq([{ id: 1 }, { id: 1 }]);
	});

	test("does nothing on mouseleave when nothing was shown", () => {
		const calls = [];
		onhover(host, [locate, data => calls.push(data)]);

		mouse("mouseleave", host);

		expect(calls).to.have.length(0);
	});

	test("destroy detaches the listeners", () => {
		const calls = [];
		const action = onhover(host, [locate, data => calls.push(data)]);

		action.destroy();

		mouse("mousemove", document.getElementById("in1"));
		vi.advanceTimersByTime(500);
		mouse("mouseleave", host);

		expect(calls).to.have.length(0);
	});
});

describe("onmove", () => {
	// onmove without hoverDelay: show is immediate, hide is delayed (hideDelay, default 250)

	test("shows located data immediately on mousemove over an item", () => {
		const calls = [];
		onmove(host, [locate, (data, ev) => calls.push([data, ev.type])]);

		mouse("mousemove", document.getElementById("in1"));

		expect(calls).to.have.length(1);
		expect(calls[0][0]).to.deep.eq({ id: 1 });
		expect(calls[0][1]).to.eq("mousemove");
	});

	test("hides after the default delay (250ms) when leaving to empty space", () => {
		const calls = [];
		onmove(host, [locate, data => calls.push(data)]);

		mouse("mousemove", document.getElementById("item2"));
		expect(calls).to.deep.eq([{ id: 2 }]);

		mouse("mousemove", document.getElementById("empty"));
		expect(calls).to.deep.eq([{ id: 2 }]); // not yet

		vi.advanceTimersByTime(250);
		expect(calls).to.deep.eq([{ id: 2 }, null]);
	});

	test("respects a custom hideDelay", () => {
		const calls = [];
		onmove(host, [locate, data => calls.push(data), { hideDelay: 100 }]);

		mouse("mousemove", document.getElementById("item2"));
		mouse("mousemove", document.getElementById("empty"));

		vi.advanceTimersByTime(99);
		expect(calls).to.deep.eq([{ id: 2 }]); // still pending

		vi.advanceTimersByTime(1);
		expect(calls).to.deep.eq([{ id: 2 }, null]);
	});

	test("moving back to an item before the delay cancels the pending hide", () => {
		const calls = [];
		onmove(host, [locate, data => calls.push(data)]);

		mouse("mousemove", document.getElementById("item2")); // show 2
		mouse("mousemove", document.getElementById("empty")); // schedule hide
		mouse("mousemove", document.getElementById("in1")); // back onto item 1

		vi.advanceTimersByTime(250);
		expect(calls).to.deep.eq([{ id: 2 }, { id: 1 }]); // no null in between
	});

	test("hides after the delay on mouseleave", () => {
		const calls = [];
		onmove(host, [locate, data => calls.push(data)]);

		mouse("mousemove", document.getElementById("in1"));
		mouse("mouseleave", host);
		expect(calls).to.deep.eq([{ id: 1 }]); // hide is deferred

		vi.advanceTimersByTime(250);
		expect(calls).to.deep.eq([{ id: 1 }, null]);
	});

	test("destroy detaches the listeners", () => {
		const calls = [];
		const action = onmove(host, [locate, data => calls.push(data)]);

		action.destroy();

		mouse("mousemove", document.getElementById("in1"));
		mouse("mouseleave", host);
		vi.advanceTimersByTime(250);

		expect(calls).to.have.length(0);
	});
});
