import { capitalize } from "@luferro/helpers/transform";

type Options = {
	prefix?: string;
	filter?: RegExp;
};

export const processEnv = ({ prefix = "SB_", filter = /^SB_/ }: Options = {}) => {
	return Object.keys(process.env).reduce<Record<string, unknown>>((accumulator, key) => {
		if (!filter.test(key)) return accumulator;
		const propertyPath = key
			.replace(new RegExp(`^${prefix}`), "")
			.toLowerCase()
			.replace(/__/g, ":")
			.split("_")
			.map((item, index) => (index === 0 ? item : capitalize(item)))
			.join("");
		accumulator[propertyPath] = process.env[key];
		return accumulator;
	}, {});
};
