import path from "node:path";
import { extractPathSegments, getFiles } from "@luferro/helpers/files";
import { Bot } from "~/structures/Bot.js";
import type { Job } from "~/types/bot.js";

export const registerJobs = async (client: Bot) => {
	const files = getFiles(path.resolve(import.meta.dirname, "../jobs"));
	for (const file of files) {
		const segment = extractPathSegments(file, "jobs");
		if (!segment) continue;

		const job: Job = await import(file);
		Bot.jobs.set(segment, job);
	}

	client.logger.info(`Jobs handler | ${files.length} job(s) registered`);
};
