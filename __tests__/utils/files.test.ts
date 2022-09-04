import path from 'path';
import * as FilesUtil from '../../src/utils/files';

describe('Files utility', () => {
	it('should verify that a file is reachable', async () => {
		const isReachable = await FilesUtil.isReachable('https://i.redd.it/2ialma4xoiv41.jpg');

		expect(isReachable).toBe(true);
	});

	it('should verify that a file is not reachable', async () => {
		const isReachable = await FilesUtil.isReachable('https://i.redd.it/mh8giylw3gu81.gif');

		expect(isReachable).toBe(false);
	});

	it('should return a list of files in a path', () => {
		const files = FilesUtil.getFiles(path.resolve(__dirname, '../../src'));

		expect(files).toBeInstanceOf(Array);
	});
});
