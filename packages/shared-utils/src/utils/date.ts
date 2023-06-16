import { getWeek, setDefaultOptions } from 'date-fns';
import * as Locale from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = process.env.TZ ?? 'UTC';

export const getLocale = () => {
	const [locale] = (process.env.LOCALE ?? 'en-US').split('-');
	return Locale[locale as keyof typeof Locale] ?? Locale[locale.slice(0, 2) as keyof typeof Locale] ?? Locale['enUS'];
};

setDefaultOptions({ locale: getLocale() });

export const isValidDate = (str: string) => {
	const { 0: year, 1: month, 2: day } = str.split(/-|\//).map(Number);
	const date = new Date(year, month - 1, day);
	return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
};

export const getCurrentDate = () => new Date();

export const getWeekNumber = () => getWeek(getCurrentDate());

export const formatDate = (date: Date | string | number) => formatInTimeZone(date, TIMEZONE, 'dd/MM/yyyy HH:mm');
