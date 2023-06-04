export const getCategoryFromPath = (path: string, splitPoint: string, suffix?: string) => {
	const base =
		path
			.split(splitPoint)[1]
			.match(/(?!(\\|\/))(.*?)(?=(\\|\/|\.))/g)
			?.filter((match) => match)
			.join('.') ?? '';
	return suffix ? `${base}.${suffix}` : base;
};
