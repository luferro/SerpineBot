export function toDecimal(value: string | number) {
	return Number(value) / 100;
}

export function slug(string: string) {
	return string
		.toString()
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^\w-]+/g, "")
		.replace(/--+/g, "-")
		.replace(/^-+/, "")
		.replace(/-+$/, "");
}

export function capitalize(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export function truncate(string: string, limit = 256) {
	if (string.length > limit) {
		const ending = "...";
		const truncated = string.slice(0, limit - ending.length) + ending;
		return truncated.trim();
	}

	return string.trim();
}

export function shuffle<T>(array: T[]) {
	let currentIndex = array.length;
	while (currentIndex !== 0) {
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
	return array;
}

export function toArray<T>(value: T | T[]) {
	return Array.isArray(value) ? value : [value];
}
