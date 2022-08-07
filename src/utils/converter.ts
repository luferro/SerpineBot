import { TimeUnit } from '../types/enums';

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

export const timeToMilliseconds = (time: number, unit: TimeUnit) => {
	const options: Record<TimeUnit, number> = {
		[TimeUnit.Seconds]: time * 1000,
		[TimeUnit.Minutes]: time * 1000 * 60,
		[TimeUnit.Hours]: time * 1000 * 60 * 60,
		[TimeUnit.Days]: time * 1000 * 60 * 60 * 24,
		[TimeUnit.Weeks]: time * 1000 * 60 * 60 * 24 * 7,
		[TimeUnit.Months]: time * 1000 * 60 * 60 * 24 * 30.4375,
		[TimeUnit.Years]: time * 1000 * 60 * 60 * 24 * 365.25,
	};

	return options[unit];
};
