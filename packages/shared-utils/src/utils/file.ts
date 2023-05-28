import fs from 'fs';
import { join } from 'path';

import { fetch } from './fetch';

export const isReachable = async (file: string) => {
	try {
		await fetch({ url: file });
		const isRemoved = file.includes('removed');

		return !isRemoved;
	} catch (error) {
		return false;
	}
};

export const getFiles = (path: string, files: string[] = []) => {
	for (const file of fs.readdirSync(path, { withFileTypes: true })) {
		if (file.isDirectory()) {
			files = getFiles(join(path, file.name), files);
			continue;
		}
		files.push(join(path, file.name));
	}

	return files;
};
