import { FileUtil, logger } from '@luferro/shared-utils';
import path from 'path';

import { Bot } from '../structures/Bot';
import type { Job } from '../types/bot';
import { getCategoryFromPath } from '../utils/filename';

export const registerJobs = async () => {
	const files = FileUtil.getFiles(path.resolve(__dirname, '../jobs'));
	for (const file of files) {
		const job: Job = await import(file);
		Bot.jobs.set(getCategoryFromPath(file, 'jobs'), job);
	}

	logger.info(`Jobs handler registered **${files.length}** job(s).`);
};
