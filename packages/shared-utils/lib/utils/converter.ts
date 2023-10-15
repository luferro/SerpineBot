import { intervalToDuration } from 'date-fns';

import { DateUtil } from '..';

type UnitType = 'Milliseconds' | 'Seconds' | 'Minutes' | 'Hours' | 'Days' | 'Weeks' | 'Months' | 'Years';

export const formatCurrency = (amount: number) => {
	const localeCode = DateUtil.getDefaultLocale().code;
	return new Intl.NumberFormat(localeCode, { style: 'currency', currency: 'EUR' }).format(amount);
};

export const centsToEuros = (cents: number) => {
	return formatCurrency(cents / 100).replace(String.fromCharCode(160), ' ');
};

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

export const formatTime = (ms: number) => {
	return Object.entries(intervalToDuration({ start: 0, end: ms }))
		.filter(({ 1: value }) => !!value)
		.map(([key, value]) => `${value}${key.charAt(0)}`)
		.join('');
};
