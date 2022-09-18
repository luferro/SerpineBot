import type { Event } from '../types/bot';
import path from 'path';
import { Bot } from '../structures/bot';
import { FileUtil } from '@luferro/shared-utils';
import { logger } from '../utils/logger';

export const register = async () => {
	const files = FileUtil.getFiles(path.resolve(__dirname, '../events'));
	for (const file of files) {
		const event: Event = await import(`../events/${file}`);
		Bot.events.set(event.data.name, event);
	}

	logger.info(`Events handler registered _*${files.length}*_ event(s).`);
};
