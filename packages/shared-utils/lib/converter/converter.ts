import { intervalToDuration } from "date-fns";

type UnitType = "Milliseconds" | "Seconds" | "Minutes" | "Hours" | "Days" | "Weeks" | "Months" | "Years";

export const toMilliseconds = (time: number, unit: UnitType) => {
	const options: Record<typeof unit, number> = {
		Milliseconds: time,
		Seconds: time * 1000,
		Minutes: time * 1000 * 60,
		Hours: time * 1000 * 60 * 60,
		Days: time * 1000 * 60 * 60 * 24,
		Weeks: time * 1000 * 60 * 60 * 24 * 7,
		Months: time * 1000 * 60 * 60 * 24 * 30.4375,
		Years: time * 1000 * 60 * 60 * 24 * 365.25,
	};
	return Number(options[unit].toFixed(2));
};

export const toSeconds = (ms: number) => Number((ms / 1000).toFixed(2));

export const toMinutes = (ms: number) => Number((ms / (1000 * 60)).toFixed(2));

export const toHours = (ms: number) => Number((ms / (1000 * 60 * 60)).toFixed(2));

type FormatCurrencyOptions = {
	/**
	 * @default "EUR"
	 */
	currency?: string;
	locale?: string;
};

export const formatCurrency = (amount: number, { currency = "EUR", locale }: FormatCurrencyOptions) => {
	return new Intl.NumberFormat(locale, { style: "currency", currency })
		.format(amount)
		.replace(String.fromCharCode(160), " ");
};

export const formatTime = (ms: number) => {
	return Object.entries(intervalToDuration({ start: 0, end: ms }))
		.filter(({ 1: value }) => !!value)
		.map(([key, value]) => `${value}${key.charAt(0)}`)
		.join("");
};
