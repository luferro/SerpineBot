import { intervalToDuration } from "date-fns";

export function formatDuration(ms: number) {
	return Object.entries(intervalToDuration({ start: 0, end: ms }))
		.filter(({ 1: value }) => !!value)
		.map(([key, value]) => `${value}${key.charAt(0)}`)
		.join("");
}
