import { capitalize } from "@luferro/helpers/transform";

type Options = {
	prefix?: string;
	filter?: RegExp;
	include?: string[];
};

export const processEnv = ({ prefix = "SB_", filter = /^SB_/, include = ["TZ", "LOCALE"] }: Options = {}) => {
	return Object.keys(process.env).reduce<Record<string, unknown>>((accumulator, key) => {
		if (include.includes(key)) {
			accumulator[key.toLowerCase()] = process.env[key];
			return accumulator;
		}

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
