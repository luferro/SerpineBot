import path from 'path';
import { Bot } from '../bot';
import * as FilesUtil from '../utils/files';
import { Job } from '../types/bot';
import { logger } from '../utils/logger';

export const register = async () => {
	const files = FilesUtil.getFiles(path.resolve(__dirname, '../jobs'));
	for (const file of files) {
		const job: Job = await import(`../jobs/${file}`);
		Bot.jobs.set(job.data.name, job);
	}

	logger.info(`Jobs handler registered _*${files.length}*_ job(s).`);
};
