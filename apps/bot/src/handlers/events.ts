import { FileUtil, logger } from '@luferro/shared-utils';
import path from 'path';

import { Bot } from '../structures/Bot';
import type { Event } from '../types/bot';
import { getCategoryFromPath } from '../utils/filename';

export const registerEvents = async () => {
	const files = FileUtil.getFiles(path.resolve(__dirname, '../events'));
	for (const file of files) {
		const event: Event = await import(file);
		Bot.events.set(getCategoryFromPath(file, 'events'), event);
	}

	logger.info(`Events handler registered **${files.length}** event(s).`);
};
