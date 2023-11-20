import parser from 'cron-parser';
import * as DateFns from 'date-fns';
import * as LocaleList from 'date-fns/locale';
import * as DateFnsTz from 'date-fns-tz';

export * from 'date-fns';

const FALLBACK_LOCALE = LocaleList['enUS'];

const extractLocale = (locale: string) => {
	const splitLocale = locale.split('-');
	return (
		LocaleList[splitLocale.join('') as keyof typeof LocaleList] ??
		LocaleList[splitLocale[0] as keyof typeof LocaleList] ??
		FALLBACK_LOCALE
	);
};

export const setI18nLocale = (locale: string) => {
	process.env.I18N_LOCALE = locale;
};

export const getTimezone = () => process.env.TZ ?? 'UTC';

export const getDefaultLocale = () => extractLocale(process.env.LOCALE ?? FALLBACK_LOCALE.code!);

export const getI18nLocale = () => {
	return process.env.I18N_LOCALE ? extractLocale(process.env.I18N_LOCALE) : getDefaultLocale();
};

export const isValid = (year: number, month: number, day: number) => {
	const date = new Date(year, month - 1, day);
	return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
};

export const getWeek = (date?: number | Date) => DateFns.getWeek(date ?? new Date());

export const format = (date: number | Date, format = 'dd/MM/yyyy HH:mm') => {
	return DateFnsTz.formatInTimeZone(date, getTimezone(), format, { locale: getI18nLocale() });
};

export const formatDistance = (date: number | Date) => {
	return DateFns.formatDistance(date, new Date(), { addSuffix: true, locale: getI18nLocale() });
};

export const parseExpression = (expression: string) => parser.parseExpression(expression);

export const getPrevious = (expression: string) => {
	const result = parseExpression(expression);
	return DateFns.subMilliseconds(new Date(), result.next().getTime() - result.prev().getTime());
};
