import fs from 'fs';
import { join } from 'path';

export const getRelativePath = (path: string, from: string, suffix?: string) => {
	const base =
		path
			.split(from)[1]
			.match(/(?!(\\|\/))(.*?)(?=(\\|\/|\.))/g)
			?.filter((match) => match)
			.join('.') ?? '';
	return suffix ? `${base}.${suffix}` : base;
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
