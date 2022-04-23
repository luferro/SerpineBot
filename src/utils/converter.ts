import { TimeUnits } from '../types/categories';

export const centsToEuros = (cents: number) => {
	return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })
		.format(cents / 100)
		.replace(String.fromCharCode(160), ' ');
};

export const minutesToHours = (time: number) => {
	const hours = time / 60;
	return Math.round(hours * 10) / 10;
};

export const minutesToHoursAndMinutes = (time: number) => {
	const hours = Math.floor(time / 60).toString();
	const minutes = (time % 60).toString().padStart(2, '0');

	return `${hours}h${minutes}m`;
};

export const secondsToMinutesAndSeconds = (time: number) => {
	const minutes = Math.floor((time % 3600) / 60)
		.toString()
		.padStart(2, '0');
	const seconds = Math.floor(time % 60)
		.toString()
		.padStart(2, '0');

	return `${minutes}:${seconds}`;
};

export const timeToMilliseconds = (time: number, unit: TimeUnits) => {
	const options: Record<string, number> = {
		seconds: time * 1000,
		minutes: time * 1000 * 60,
		hours: time * 1000 * 60 * 60,
		days: time * 1000 * 60 * 60 * 24,
		weeks: time * 1000 * 60 * 60 * 24 * 7,
		months: time * 1000 * 60 * 60 * 24 * 30.4375,
		years: time * 1000 * 60 * 60 * 24 * 365.25,
	};

	return options[unit];
};
