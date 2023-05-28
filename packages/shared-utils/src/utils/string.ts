export const slug = (string: string) => {
	return string
		.toString()
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^\w-]+/g, '')
		.replace(/--+/g, '-')
		.replace(/^-+/, '')
		.replace(/-+$/, '');
};

export const capitalize = (string: string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

export const truncate = (string: string, limit = 256) => {
	if (string.length > limit) {
		const ending = '...';
		const truncated = string.slice(0, limit - ending.length) + ending;
		return truncated.trim();
	}

	return string.trim();
};

export const format = <T>(string: string, ...args: string[]) => {
	const matches = string.match(/:(\w|\d)+/g);
	if (!matches) throw new Error('Invalid string format.');
	if (matches.length !== args.length) throw new Error('Amount of format fields and arguments do not match');

	for (const [index, match] of matches.entries()) {
		string = string.replace(match, args[index]);
	}

	return string as T;
};
