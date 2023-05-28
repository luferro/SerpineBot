export const centsToEuros = (cents: number) => {
	return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })
		.format(cents / 100)
		.replace(String.fromCharCode(160), ' ');
};

export const toMilliseconds = (
	time: number,
	unit: 'Milliseconds' | 'Seconds' | 'Minutes' | 'Hours' | 'Days' | 'Weeks' | 'Months' | 'Years',
) => {
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
	return options[unit];
};

export const toSeconds = (ms: number) => ms / 1000;

export const toMinutes = (ms: number) => ms / (1000 * 60);

export const toHours = (ms: number) => ms / (1000 * 60 * 60);

export const toMinutesFormatted = (ms: number) => {
	const seconds = Math.floor(toSeconds(ms) % 60)
		.toString()
		.padStart(2, '0');
	return `${Math.floor(toMinutes(ms))}:${seconds}`;
};

export const toHoursFormatted = (ms: number) => {
	const minutes = Math.floor(toMinutes(ms) % 60)
		.toString()
		.padStart(2, '0');
	return `${Math.floor(toHours(ms))}h${minutes}`;
};
