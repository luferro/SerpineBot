import R from "ramda";

export const splitIntoChunks = <T>(array: T[], size: number) => {
	const result: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		result.push(array.slice(i, i + size));
	}

	return result;
};

export const partition = <T, U>(array: T[], filter: (item: T) => boolean) => {
	return array.reduce<[U[], Exclude<T, U>[]]>(
		(acc, el) => {
			if (filter(el)) {
				acc[0].push(el as unknown as U);
			} else {
				acc[1].push(el as Exclude<T, U>);
			}
			return acc;
		},
		[[], []],
	);
};

export const shuffle = <T>(array: T[]) => {
	let currentIndex = array.length;
	while (currentIndex !== 0) {
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
	return array;
};

export const enumToArray = <T extends { [name: string]: number | string }>(enumeration: T) => {
	return Object.keys(enumeration)
		.filter((value) => Number.isNaN(Number(value)))
		.map((value) => value as keyof T);
};

const fieldExists = <T extends object>(field: string, obj1: T, obj2: T) => {
	return R.equals(R.path(field.split("."), obj1), R.path(field.split("."), obj2));
};

export const someFieldExists = <T extends object>(fields: string[], obj1: T, obj2: T) => {
	return R.any((field) => fieldExists(field, obj1, obj2), fields ?? []);
};

export const everyFieldExists = <T extends object>(fields: string[], obj1: T, obj2: T) => {
	return R.all((field) => fieldExists(field, obj1, obj2), fields ?? []);
};
