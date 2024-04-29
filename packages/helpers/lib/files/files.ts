const fs = await import("node:fs").catch(() => null);
const path = await import("node:path").catch(() => null);

export const extractPathSegments = (dir: string, from: string) => {
	return (
		dir
			.split(from)[1]
			.match(/(?!(\\|\/))(.*?)(?=(\\|\/|\.))/g)
			?.filter((match) => match)
			.join(".") ?? ""
	);
};

export const getFiles = (dir: string, files: string[] = []) => {
	if (!fs || !path) return [];

	for (const file of fs.readdirSync(dir, { withFileTypes: true })) {
		if (file.isDirectory()) {
			files = getFiles(path.join(dir, file.name), files);
			continue;
		}
		files.push(path.join(dir, file.name));
	}

	return files;
};
