import fs from "node:fs";
import { join } from "node:path";

export const extractPathSegments = (path: string, from: string) => {
	return (
		path
			.split(from)[1]
			.match(/(?!(\\|\/))(.*?)(?=(\\|\/|\.))/g)
			?.filter((match) => match)
			.join(".") ?? ""
	);
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
