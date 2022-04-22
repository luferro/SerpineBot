import path from 'path';
import * as FilesUtil from '../../src/utils/files';

describe('Files utility', () => {
	it('should verify that a file is available', async () => {
		const isAvailable = await FilesUtil.isAvailable('https://i.redd.it/2ialma4xoiv41.jpg');

		expect(isAvailable).toBe(true);
	});

	it('should verify that a file is not available', async () => {
		const isAvailable = await FilesUtil.isAvailable('https://i.redd.it/mh8giylw3gu81.gif');

		expect(isAvailable).toBe(false);
	});

	it('should return a list of files in a path', () => {
		const files = FilesUtil.getFiles(path.resolve(__dirname, '../../src'));

		expect(files).toBeInstanceOf(Array);
	});
});
