import { tz } from "@date-fns/tz";
import parser from "cron-parser";
import * as DateFns from "date-fns";
import * as LocaleList from "date-fns/locale";

export * from "date-fns";
export * from "@date-fns/tz";

function getLocale(locale: string) {
	const splitLocale = locale.split("-");
	return (
		LocaleList[splitLocale.join("") as keyof typeof LocaleList] ??
		LocaleList[splitLocale[0] as keyof typeof LocaleList] ??
		LocaleList.enUS
	);
}

export function parseCronExpression(expression: string) {
	return parser.parseExpression(expression);
}

type TimeUnit = "Milliseconds" | "Seconds" | "Minutes" | "Hours" | "Days" | "Weeks" | "Months" | "Years";

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

type FormatDateOptions = {
	/**
	 * Date format
	 * @default "dd/MM/yyyy HH:mm"
	 */
	format?: string;
	/**
	 * Timezone
	 * @default "utc"
	 */
	timezone?: string;
	/**
	 * @default "en-US"
	 */
	locale?: string;
};

export function formatDate(
	date: number | Date,
	{ format = "dd/MM/yyyy HH:mm", timezone = "utc", locale = "en-US" }: FormatDateOptions = {},
) {
	const options = { locale: getLocale(locale), in: tz(timezone) };
	return DateFns.formatDate(date, format, options);
}

type FormatDistanceOptions = {
	/**
	 * End date
	 * @default new Date()
	 */
	to?: number | Date;
	/**
	 * Timezone
	 * @default "utc"
	 */
	timezone?: string;
	/**
	 * @default "en-US"
	 */
	locale?: string;
};

export function formatDistance(
	from: number | Date,
	{ to = new Date(), timezone = "utc", locale = "en-US" }: FormatDistanceOptions = {},
) {
	const options = { addSufix: true, locale: getLocale(locale), in: tz(timezone) };
	return DateFns.formatDistance(from, to, options);
}

export function formatTime(ms: number) {
	return Object.entries(DateFns.intervalToDuration({ start: 0, end: ms }))
		.filter(({ 1: value }) => !!value)
		.map(([key, value]) => `${value}${key.charAt(0)}`)
		.join("");
}
