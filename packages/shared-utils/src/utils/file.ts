import fs from 'fs';
import { join } from 'path';

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
