export interface ILocale {
	dayShort: string[];
	dayFull: string[];
	monthShort: string[];
	monthFull: string[];

	weekStart?: number;

	am?: string[];
	pm?: string[];
}

function toFixed(num: number): string {
	if (num < 10) return "0" + num;
	return num.toString();
}
function toFixedMs(num: number): string {
	const temp = toFixed(num);
	return temp.length == 2 ? "0" + temp : temp;
}

export function getDuodecade(year: number): { start: number; end: number } {
	const start = Math.floor(year / 11) * 11;
	return {
		start,
		end: start + 11,
	};
}

// returns ISO week number (week starts on Monday)
function getWeekNumber(ndate: Date): number {
	const nday = (ndate.getDay() + 6) % 7;

	const pivot = new Date(ndate.valueOf());
	pivot.setDate(ndate.getDate() + (3 - nday));
	pivot.setHours(0, 0, 0, 0);

	const jan1 = new Date(pivot.getFullYear(), 0, 1);
	const ordinal = Math.round((pivot.getTime() - jan1.getTime()) / 86400000);

	return 1 + Math.floor(ordinal / 7);
}

const emptyAmPm = ["", ""];
function date2str(mask: string, date: Date, locale: ILocale): number | string {
	switch (mask) {
		case "%d":
			return toFixed(date.getDate());
		case "%m":
			return toFixed(date.getMonth() + 1);
		case "%j":
			return date.getDate();
		case "%n":
			return date.getMonth() + 1;
		case "%y":
			return toFixed(date.getFullYear() % 100);
		case "%Y":
			return date.getFullYear();
		case "%D":
			return locale.dayShort[date.getDay()];
		case "%l":
			return locale.dayFull[date.getDay()];
		case "%M":
			return locale.monthShort[date.getMonth()];
		case "%F":
			return locale.monthFull[date.getMonth()];
		case "%h":
			return toFixed(((date.getHours() + 11) % 12) + 1);
		case "%g":
			return ((date.getHours() + 11) % 12) + 1;
		case "%G":
			return date.getHours();
		case "%H":
			return toFixed(date.getHours());
		case "%i":
			return toFixed(date.getMinutes());
		case "%a":
			return ((date.getHours() > 11 ? locale.pm : locale.am) || emptyAmPm)[0];
		case "%A":
			return ((date.getHours() > 11 ? locale.pm : locale.am) || emptyAmPm)[1];
		case "%s":
			return toFixed(date.getSeconds());
		case "%S":
			return toFixedMs(date.getMilliseconds());
		case "%W":
			return toFixed(getWeekNumber(date));
		case "%w": {
			const ws = locale.weekStart ?? 1;
			if (ws === 1) return toFixed(getWeekNumber(date));
			// find the Monday of the current locale-week, use its ISO week number
			const dayInWeek = (date.getDay() - ws + 7) % 7;
			const monInWeek = (1 - ws + 7) % 7;
			const monday = new Date(date.valueOf());
			monday.setDate(date.getDate() + (monInWeek - dayInWeek));
			return toFixed(getWeekNumber(monday));
		}
		case "%c": {
			let str = date.getFullYear() + "";
			str += "-" + toFixed(date.getMonth() + 1);
			str += "-" + toFixed(date.getDate());
			str += "T";
			str += toFixed(date.getHours());
			str += ":" + toFixed(date.getMinutes());
			str += ":" + toFixed(date.getSeconds());
			return str;
		}
		case "%Q":
			return Math.floor(date.getMonth() / 3) + 1;
		default:
			return mask;
	}
}

const formatFlags = /%[a-zA-Z]/g;
type DateFormatter = (date: Date) => string;

export function dateToString(format: string, locale: ILocale): DateFormatter {
	if (typeof format == "function") return format;

	return function (date: Date): string {
		if (!date) return "";
		if (!date.getMonth) date = new Date(date);

		return format.replace(
			formatFlags,
			s => date2str(s, date, locale) as string
		);
	};
}
