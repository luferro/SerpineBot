import path from "node:path";
import { FsUtil } from "@luferro/shared-utils";
import { Bot } from "../structures/Bot";
import type { Job } from "../types/bot";

export const registerJobs = async (client: Bot) => {
	const files = FsUtil.getFiles(path.resolve(__dirname, "../jobs"));
	for (const file of files) {
		const segment = FsUtil.extractPathSegments(file, "jobs");
		if (!segment) continue;

		const job: Job = await import(file);
		Bot.jobs.set(segment, job);
	}

	client.logger.info(`Jobs handler | ${files.length} job(s) registered`);
};
