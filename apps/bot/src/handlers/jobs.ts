import type { Job } from '../types/bot';
import path from 'path';
import { Bot } from '../structures/bot';
import { FileUtil, logger } from '@luferro/shared-utils';

export const register = async () => {
	const files = FileUtil.getFiles(path.resolve(__dirname, '../jobs'));
	for (const file of files) {
		const job: Job = await import(`../jobs/${file}`);
		Bot.jobs.set(job.data.name, job);
	}

	logger.info(`Jobs handler registered **${files.length}** job(s).`);
};
