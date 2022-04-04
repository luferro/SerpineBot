import path from 'path';
import { Bot } from '../bot';
import * as FilesUtil from '../utils/files';
import { Job } from '../types/bot';
import { logger } from '../utils/logger';

export const register = async (client: Bot) => {
    const files = FilesUtil.getFiles(path.resolve(__dirname, '../jobs'));
    for(const file of files) {
        const job: Job = await import(`../jobs/${file}`);
        client.jobs.set(job.data.name, job);
    }

    logger.info(`Jobs Handler: ${files.length} jobs have been registered.`);
}