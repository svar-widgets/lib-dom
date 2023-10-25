import { expect, test } from "vitest";
import { locale } from "../src/index";

test("ID can override", () => {
	let d = locale({ calendar: { a: 1, c: 3 } });
	let e = d.extend({ calendar: { a: 2, b: 2 } });
	expect(d.getRaw().calendar).deep.eq({ a: 1, c: 3 });
	expect(e.getRaw().calendar).deep.eq({ a: 2, b: 2, c: 3 });
});
test("ID can override with optional", () => {
	let d = locale({ calendar: { a: 1, c: 3 } });
	let e = d.extend({ calendar: { a: 2, b: 2 } }, true);
	expect(d.getRaw().calendar).deep.eq({ a: 1, c: 3 });
	expect(e.getRaw().calendar).deep.eq({ a: 1, b: 2, c: 3 });
});
