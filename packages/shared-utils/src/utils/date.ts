import { getWeek, Locale, setDefaultOptions } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = process.env.TZ ?? 'UTC';
const LOCALE = (process.env.LOCALE ?? 'en-US') as unknown as Locale;
setDefaultOptions({ locale: LOCALE });

export const isValidDate = (str: string) => {
	const { 0: year, 1: month, 2: day } = str.split(/-|\//).map(Number);
	const date = new Date(year, month - 1, day);
	return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
};

export const getCurrentDate = () => new Date();

export const getWeekNumber = () => getWeek(getCurrentDate());

export const formatDate = (date: Date | string | number) => formatInTimeZone(date, TIMEZONE, 'dd/MM/yyyy HH:mm');
