import { formatDistance, getWeek, isToday } from 'date-fns';
import * as LocaleList from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

type Locale = { locale: string };
type ExtendedDate = { year: number; month: number; day: number };
type SimpleDate = { date: Date | number };
type Format = { format: string };

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

export const isValidDate = ({ year, month, day }: ExtendedDate) => {
	const date = new Date(year, month - 1, day);
	return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
};

export const getCurrentDate = () => new Date();

export const getWeekNumber = () => getWeek(getCurrentDate());

export const isDateToday = ({ date }: SimpleDate) => isToday(date);

export const formatDate = ({ date, format = 'dd/MM/yyyy HH:mm' }: SimpleDate & Partial<Format>) => {
	return formatInTimeZone(date, getTimezone(), format, { locale: getI18nLocale() });
};

export const formatDateDistance = ({ date }: SimpleDate) => {
	return formatDistance(date, getCurrentDate(), { addSuffix: true, locale: getI18nLocale() });
};
