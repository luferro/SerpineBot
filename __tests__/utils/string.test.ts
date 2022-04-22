import * as StringUtil from '../../src/utils/string';

describe('String utility', () => {
	it('should slugify a string', () => {
		expect(StringUtil.slug('slugify unit test')).toBe('slugify-unit-test');
	});

	it('should capitalize a string', () => {
		expect(StringUtil.capitalize('capitalize')).toBe('Capitalize');
	});

	it('should truncate a string', () => {
		const truncatedString = stringTruncation(300);

		expect(truncatedString).toHaveLength(256);
	});

	it('should not truncate a string', () => {
		const truncatedString = stringTruncation(20);

		expect(truncatedString).toHaveLength(20);
	});

	const stringTruncation = (stringLength: number) => {
		const string = 'a'.repeat(stringLength);
		return StringUtil.truncate(string);
	};
});
