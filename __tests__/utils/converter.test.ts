import * as ConverterUtil from '../../src/utils/converter';

describe('Converter utility', () => {
	it('should convert minutes to hours', () => {
		expect(ConverterUtil.minutesToHours(90)).toBe(1.5);
	});

	it('should convert seconds to a stringified format', () => {
		expect(ConverterUtil.secondsToMinutesAndSeconds(90)).toBe('01:30');
	});

	it('should convert minutes to a stringified format', () => {
		expect(ConverterUtil.minutesToHoursAndMinutes(90)).toBe('1h30m');
	});

	it('should convert cents to a stringified format', () => {
		expect(ConverterUtil.centsToEuros(50)).toBe('0,50 €');
	});

	it('should convert time to milliseconds according to chosen unit', () => {
		const time = 90;

		expect(ConverterUtil.timeToMilliseconds(time, 'seconds')).toBe(90_000);
		expect(ConverterUtil.timeToMilliseconds(time, 'minutes')).toBe(5_400_000);
		expect(ConverterUtil.timeToMilliseconds(time, 'hours')).toBe(324_000_000);
		expect(ConverterUtil.timeToMilliseconds(time, 'days')).toBe(7_776_000_000);
		expect(ConverterUtil.timeToMilliseconds(time, 'weeks')).toBe(54_432_000_000);
		expect(ConverterUtil.timeToMilliseconds(time, 'months')).toBe(236_682_000_000);
		expect(ConverterUtil.timeToMilliseconds(time, 'years')).toBe(2_840_184_000_000);
	});
});
