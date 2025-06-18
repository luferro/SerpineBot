export function toDecimal(value: string | number) {
	return Number(value) / 100;
}

export function slug(str: string) {
	return str
		.toString()
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^\w-]+/g, "")
		.replace(/--+/g, "-")
		.replace(/^-+/, "")
		.replace(/-+$/, "");
}

export function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, limit = 256) {
	if (str.length > limit) {
		const ending = "...";
		const truncated = str.slice(0, limit - ending.length) + ending;
		return truncated.trim();
	}

	return str.trim();
}

export function shuffle<T>(arr: T[]) {
	let currentIndex = arr.length;
	while (currentIndex !== 0) {
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
	}
	return arr;
}

export function toArray<T>(value: T | T[]) {
	return Array.isArray(value) ? value : [value];
}

export function getPossessive(str: string) {
	return str.endsWith("s") ? "'" : "'s";
}

export function getPossessiveForm(str: string) {
	return `${str}${getPossessive(str)}`;
}
