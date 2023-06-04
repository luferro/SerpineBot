import { logger } from '@luferro/shared-utils';

import * as CommandsHandler from '../handlers/commands';
import type { Bot } from '../structures/Bot';
import type { EventData } from '../types/bot';

export const data: EventData = { type: 'once' };

export const execute = async (client: Bot) => {
	await CommandsHandler.deployCommands(client);

	for (const [guildId, guild] of client.guilds.cache) {
		const settings = await client.settings.get(guildId);
		if (!settings) client.emit('guildCreate', guild);
	}

	logger.info(`SerpineBot is ready to process interactions.`);
};
