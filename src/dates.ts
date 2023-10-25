export interface ILocale {
	dayShort: string[];
	dayFull: string[];
	monthShort: string[];
	monthFull: string[];

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

function getISOWeek(ndate: Date): number {
	let nday = ndate.getDay();
	if (nday === 0) {
		nday = 7;
	}
	const first_thursday = new Date(ndate.valueOf());
	first_thursday.setDate(ndate.getDate() + (4 - nday));
	const year_number = first_thursday.getFullYear(); // year of the first Thursday
	const ordinal_date = Math.floor(
		(first_thursday.getTime() - new Date(year_number, 0, 1).getTime()) /
			86400000
	); //ordinal date of the first Thursday - 1 (so not really ordinal date)
	const weekNumber = 1 + Math.floor(ordinal_date / 7);
	return weekNumber;
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
			return toFixed(getISOWeek(date));
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
		default:
			return mask;
	}
}

const formatFlags = /%[a-zA-Z]/g;

export function dateToString(format: string, locale: ILocale) {
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
