import type { TimeUnit } from '../types/unit';

export const centsToEuros = (cents: number) => {
	return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })
		.format(cents / 100)
		.replace(String.fromCharCode(160), ' ');
};

export const toMilliseconds = (time: number, unit: Exclude<TimeUnit, 'Milliseconds'>) => {
	const options: Record<typeof unit, number> = {
		Seconds: time * 1000,
		Minutes: time * 1000 * 60,
		Hours: time * 1000 * 60 * 60,
		Days: time * 1000 * 60 * 60 * 24,
		Weeks: time * 1000 * 60 * 60 * 24 * 7,
		Months: time * 1000 * 60 * 60 * 24 * 30.4375,
		Years: time * 1000 * 60 * 60 * 24 * 365.25,
	};
	return options[unit];
};

export const toSeconds = (ms: number) => {
	return ms / 1000;
};

export const toMinutes = (ms: number, formatted = false) => {
	const minutes = ms / (1000 * 60);
	if (formatted) {
		const seconds = Math.floor((ms / 1000) % 60)
			.toString()
			.padStart(2, '0');
		return `${Math.floor(minutes)}:${seconds}`;
	}
	return minutes;
};

export const toHours = (ms: number, formatted = false) => {
	const hours = ms / (1000 * 60 * 60);
	if (formatted) {
		const minutes = Math.floor((ms / (1000 * 60)) % 60)
			.toString()
			.padStart(2, '0');
		return `${Math.floor(hours)}h${minutes}`;
	}
	return hours;
};
