import * as SleepUtil from '../../src/utils/sleep';

describe('Sleep utility', () => {
	it('should sleep for n milliseconds', async () => {
		const beforeSleep = Date.now();
		await SleepUtil.timeout(100);
		const afterSleep = Date.now();

		expect(afterSleep - beforeSleep).toBeGreaterThanOrEqual(100);
	});
});
