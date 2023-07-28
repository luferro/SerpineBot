import { FileUtil, logger } from '@luferro/shared-utils';
import path from 'path';

import { Bot } from '../Bot';
import type { Event } from '../types/bot';

export const registerEvents = async () => {
	const files = FileUtil.getFiles(path.resolve(__dirname, '../events'));
	for (const file of files) {
		const event: Event = await import(file);
		const [filename] = path.basename(file).split('.');
		Bot.events.set(filename, event);
	}

	logger.info(`Events handler registered **${files.length}** event(s).`);
};
