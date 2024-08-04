import parser from "cron-parser";
import * as DateFns from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import * as LocaleList from "date-fns/locale";

export * from "date-fns";

const getLocale = (locale: string) => {
	const splitLocale = locale.split("-");
	return (
		LocaleList[splitLocale.join("") as keyof typeof LocaleList] ??
		LocaleList[splitLocale[0] as keyof typeof LocaleList] ??
		LocaleList.enUS
	);
};

export const toMilliseconds = (
	time: number,
	unit: "Milliseconds" | "Seconds" | "Minutes" | "Hours" | "Days" | "Weeks" | "Months" | "Years",
) => {
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

export const toTimezone = (date: Date | string | number, timezone: string) => toZonedTime(date, timezone);

export const fromTimezone = (date: Date | string | number, timezone: string) => fromZonedTime(date, timezone);

export const isValid = (year: number, month: number, day: number) => {
	const date = new Date(year, month - 1, day);
	return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
};

export const getPrevious = (expression: string) => {
	const result = parser.parseExpression(expression);
	return DateFns.subMilliseconds(new Date(), result.next().getTime() - result.prev().getTime());
};

type FormatOptions = {
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
	/** @default "en-US" */
	locale?: string;
};

export const formatDate = (
	date: number | Date,
	{ format = "dd/MM/yyyy HH:mm", timezone = "utc", locale = "en-US" }: FormatOptions = {},
) => {
	return formatInTimeZone(date, timezone, format, { locale: getLocale(locale) });
};

type FormatDistanceOptions = {
	/**
	 * End date
	 * @default new Date()
	 */
	to?: number | Date;
	/** @default "en-US" */
	locale?: string;
};

export const formatDistance = (
	from: number | Date,
	{ to = new Date(), locale = "en-US" }: FormatDistanceOptions = {},
) => {
	return DateFns.formatDistance(from, to, { addSuffix: true, locale: getLocale(locale) });
};

export const formatTime = (ms: number) => {
	return Object.entries(DateFns.intervalToDuration({ start: 0, end: ms }))
		.filter(({ 1: value }) => !!value)
		.map(([key, value]) => `${value}${key.charAt(0)}`)
		.join("");
};
