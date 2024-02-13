import { StringUtil } from "@luferro/shared-utils";

type Options = {
	prefix?: string;
	filter?: RegExp;
};

export const processEnv = ({ prefix = "SB_", filter = /^SB_/ }: Options = {}) => {
	const result = Object.keys(process.env).reduce<Record<string, unknown>>((accumulator, key) => {
		if (!filter.test(key)) return accumulator;
		const propertyPath = key
			.replace(new RegExp(`^${prefix}`), "")
			.toLowerCase()
			.replace(/__/g, ".")
			.split("_")
			.map((item, index) => (index === 0 ? item : StringUtil.capitalize(item)))
			.join("");
		accumulator[propertyPath] = process.env[key];
		return accumulator;
	}, {});

	return unflatten(result);
};

const unflatten = (obj: Record<string, unknown>) => {
	return Object.entries(obj).reduce<typeof obj>((result, [key, value]) => {
		const keys = key.split(".");
		keys.reduce((level, currentKey, index) => {
			if (!level[currentKey]) level[currentKey] = index === keys.length - 1 ? value : {};
			return level[currentKey] as typeof obj;
		}, result);

		return result;
	}, {});
};
