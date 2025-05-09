export type TimeUnit = "Milliseconds" | "Seconds" | "Minutes" | "Hours" | "Days" | "Weeks" | "Months" | "Years";

export function toTimeUnit(from: { time: number; unit: TimeUnit }, to: TimeUnit) {
	const ms: Record<typeof to, number> = {
		Milliseconds: 1,
		Seconds: 1000,
		Minutes: 1000 * 60,
		Hours: 1000 * 60 * 60,
		Days: 1000 * 60 * 60 * 24,
		Weeks: 1000 * 60 * 60 * 24 * 7,
		Months: 1000 * 60 * 60 * 24 * 30.44,
		Years: 1000 * 60 * 60 * 24 * 365.25,
	};

	const timeInMilliseconds = from.time * ms[from.unit];
	const convertedTime = timeInMilliseconds / ms[to];
	return Number(convertedTime.toFixed(2));
}

export function toSeconds(ms: number) {
	return Math.floor(toTimeUnit({ time: ms, unit: "Milliseconds" }, "Seconds"));
}
