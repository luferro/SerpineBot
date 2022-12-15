import type { EventData } from '../types/bot';
import type { Bot } from '../structures/bot';
import { logger } from '@luferro/shared-utils';
import * as CommandsHandler from '../handlers/commands';
import { settingsModel } from '../database/models/settings';
import { EventName } from '../types/enums';

export const data: EventData = {
	name: EventName.Ready,
	type: 'once',
};

export const execute = async (client: Bot) => {
	await CommandsHandler.deploy(client);

	for (const [guildId, guild] of client.guilds.cache) {
		const guildSettings = await settingsModel.findOne({ guildId });
		if (!guildSettings) client.emit('guildCreate', guild);
	}

	logger.info(`SerpineBot is ready to process interactions.`);
};
