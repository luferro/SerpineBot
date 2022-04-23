import path from 'path';
import { Bot } from '../bot';
import * as FilesUtil from '../utils/files';
import { Event } from '../types/bot';
import { logger } from '../utils/logger';

export const register = async () => {
	const files = FilesUtil.getFiles(path.resolve(__dirname, '../events'));
	for (const file of files) {
		const event: Event = await import(`../events/${file}`);
		Bot.events.set(event.data.name, event);
	}

	logger.info(`Events handler registered _*${files.length}*_ event(s).`);
};
