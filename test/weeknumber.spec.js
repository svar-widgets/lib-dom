import { expect, test } from "vitest";
import { dateToString } from "../src/index";

// minimal locale stubs
const localeSunday = {
	dayShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
	dayFull: [],
	monthShort: [],
	monthFull: [],
	weekStart: 0,
};

const localeMonday = {
	dayShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
	dayFull: [],
	monthShort: [],
	monthFull: [],
	weekStart: 1,
};

// %W = pure ISO week (always weekStart=Monday)
// %w = locale-aware week start, but ISO week numbers (finds Monday of locale-week)
const fmtW = dateToString("%W", localeMonday);
const fmtw_sun = dateToString("%w", localeSunday);
const fmtw_mon = dateToString("%w", localeMonday);

test("%w: Dec 28 (Sun, weekStart=0) matches Dec 29 (Mon, weekStart=1)", () => {
	// Sun Dec 28 starts a new visual week when weekStart=Sunday.
	// Its Monday is Dec 29 → ISO week 01.
	const sun = new Date(2025, 11, 28);
	const mon = new Date(2025, 11, 29);
	expect(fmtw_sun(sun)).toBe("01");
	expect(fmtw_mon(mon)).toBe("01");
	expect(fmtw_sun(sun)).toBe(fmtw_mon(mon));
});

test("%w: Dec 27 (Sat) is last day of previous locale-week when weekStart=0", () => {
	// Sat Dec 27 belongs to the Sun Dec 21-Sat Dec 27 week.
	// Its Monday is Dec 22 → ISO week 52.
	const sat = new Date(2025, 11, 27);
	expect(fmtw_sun(sat)).toBe("52");
});

test("%w: entire Sun-Sat locale-week has same week number", () => {
	const sun = new Date(2025, 11, 28);
	const sat = new Date(2026, 0, 3);
	expect(fmtw_sun(sun)).toBe(fmtw_sun(sat));
});

test("%W: pure ISO - Dec 29 is week 01, Dec 28 is week 52", () => {
	expect(fmtW(new Date(2025, 11, 29))).toBe("01");
	expect(fmtW(new Date(2025, 11, 28))).toBe("52");
});

test("%w with weekStart=1 is identical to %W", () => {
	const dates = [
		new Date(2025, 0, 1),
		new Date(2025, 5, 15),
		new Date(2025, 11, 28),
		new Date(2025, 11, 31),
	];
	for (const d of dates) {
		expect(fmtw_mon(d)).toBe(fmtW(d));
	}
});

// DST spring-forward: March 29, 2026 02:00 in Europe
// March 23 (Mon) = week 13, March 30 (Mon) = week 14
test("DST: March 23 at 00:00 - week 13", () => {
	const d = new Date(2026, 2, 23, 0, 0, 0, 0);
	expect(fmtW(d)).toBe("13");
	expect(fmtw_mon(d)).toBe("13");
});

test("DST: March 30 at 00:00 - week 14 (day after spring-forward)", () => {
	const d = new Date(2026, 2, 30, 0, 0, 0, 0);
	expect(fmtW(d)).toBe("14");
	expect(fmtw_mon(d)).toBe("14");
});

test("DST: March 29 (Sun, weekStart=0) → week 14 via Monday March 30", () => {
	// Sun March 29 starts a locale-week whose Monday is March 30 (DST transition day)
	const d = new Date(2026, 2, 29, 0, 0, 0, 0);
	expect(fmtw_sun(d)).toBe("14");
});
