import parser from "cron-parser";
import * as DateFns from "date-fns";
import * as DateFnsTz from "date-fns-tz";
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
	/**
	 * @default "en-US"
	 */
	locale?: string;
};

export const format = (
	date: number | Date,
	{ format = "dd-MM-yyyy HH:mm", timezone = "utc", locale = "en-US" }: FormatOptions = {},
) => {
	return DateFnsTz.formatInTimeZone(date, timezone, format, { locale: getLocale(locale) });
};

type FormatDistanceOptions = {
	/**
	 * End date
	 * @default new Date()
	 */
	to?: number | Date;
	/**
	 * @default "en-US"
	 */
	locale?: string;
};

export const formatDistance = (
	from: number | Date,
	{ to = new Date(), locale = "en-US" }: FormatDistanceOptions = {},
) => {
	return DateFns.formatDistance(from, to, { addSuffix: true, locale: getLocale(locale) });
};
