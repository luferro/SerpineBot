import type { Event } from '../types/bot';
import path from 'path';
import { Bot } from '../structures/bot';
import { FileUtil, logger } from '@luferro/shared-utils';

export const register = async () => {
	const files = FileUtil.getFiles(path.resolve(__dirname, '../events'));
	for (const file of files) {
		const event: Event = await import(`../events/${file}`);
		Bot.events.set(event.data.name, event);
	}

	logger.info(`Events handler registered **${files.length}** event(s).`);
};
