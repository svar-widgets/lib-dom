type Dictionary = (key: string) => string;
type IHash<T> = { [key: string]: T };
type Group<T> = IHash<IHash<T> | T>;
export type Terms = Group<string>;

export interface ILocale {
	getGroup(group: string): Dictionary;
	getRaw(): Terms;
	extend(values: Terms, optional: boolean): ILocale;
}

function isObject(a: string | IHash<string>) {
	return a && typeof a === "object" && !Array.isArray(a);
}

function extend(a: Terms, b: Terms): Terms {
	for (const key in b) {
		const from = b[key];
		if (isObject(a[key]) && isObject(from)) {
			a[key] = extend(
				{ ...(a[key] as IHash<string>) },
				b[key] as IHash<string>
			) as IHash<string>;
		} else {
			a[key] = b[key];
		}
	}

	return a;
}

export function locale(words: Terms): ILocale {
	return {
		getGroup(group: string): Dictionary {
			const block = words[group] as IHash<string>;
			return (key: string) => {
				return block ? block[key] || key : key;
			};
		},
		getRaw(): Terms {
			return words;
		},
		extend(values: Terms, optional: boolean): ILocale {
			if (!values) return this;

			let data: Terms;
			if (optional) {
				data = extend({ ...values }, words);
			} else {
				data = extend({ ...words }, values);
			}

			return locale(data);
		},
	};
}
