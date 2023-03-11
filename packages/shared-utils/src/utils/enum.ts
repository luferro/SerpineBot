export const enumKeysToArray = <T extends { [name: string]: number | string }>(enumeration: T) => {
	return Object.keys(enumeration)
		.filter((value) => isNaN(Number(value)))
		.map((value) => value as keyof T);
};
