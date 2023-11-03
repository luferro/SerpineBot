import * as DateFns from 'date-fns';
import * as LocaleList from 'date-fns/locale';
import * as DateFnsTz from 'date-fns-tz';

type Locale = { locale: string };
type ExtendedDate = { year: number; month: number; day: number };
type SimpleDate = { date: Date | number };
type Format = { format: string };
type Amount = { amount: number };

const FALLBACK_LOCALE = LocaleList['enUS'];

const extractLocale = ({ locale }: Locale) => {
	const splitLocale = locale.split('-');
	return (
		LocaleList[splitLocale.join('') as keyof typeof LocaleList] ??
		LocaleList[splitLocale[0] as keyof typeof LocaleList] ??
		FALLBACK_LOCALE
	);
};

export const setI18nLocale = ({ locale }: Locale) => {
	process.env.I18N_LOCALE = locale;
};

export const getTimezone = () => process.env.TZ ?? 'UTC';

export const getDefaultLocale = () => extractLocale({ locale: process.env.LOCALE ?? FALLBACK_LOCALE.code! });

export const getI18nLocale = () => {
	return process.env.I18N_LOCALE ? extractLocale({ locale: process.env.I18N_LOCALE }) : getDefaultLocale();
};

export const isValid = ({ year, month, day }: ExtendedDate) => {
	const date = new Date(year, month - 1, day);
	return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
};

export const getCurrentDate = () => new Date();

export const getWeek = () => DateFns.getWeek(getCurrentDate());

export const isToday = ({ date }: SimpleDate) => DateFns.isToday(date);

export const addHours = ({ date, amount }: SimpleDate & Amount) => DateFns.addHours(date, amount);

export const addDays = ({ date, amount }: SimpleDate & Amount) => DateFns.addDays(date, amount);

export const format = ({ date, format = 'dd/MM/yyyy HH:mm' }: SimpleDate & Partial<Format>) => {
	return DateFnsTz.formatInTimeZone(date, getTimezone(), format, { locale: getI18nLocale() });
};

export const formatDistance = ({ date }: SimpleDate) => {
	return DateFns.formatDistance(date, getCurrentDate(), { addSuffix: true, locale: getI18nLocale() });
};
