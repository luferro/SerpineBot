import type { Bot } from '../structures/bot';
import * as CommandsHandler from '../handlers/commands';
import { settingsModel } from '../database/models/settings';
import { logger } from '../utils/logger';
import { EventName } from '../types/enums';

export const data = {
	name: EventName.Ready,
	type: 'once',
};

export const execute = async (client: Bot) => {
	await CommandsHandler.deploy(client);

	for (const [guildId, guild] of client.guilds.cache) {
		const settings = await settingsModel.findOne({ guildId });
		if (!settings) client.emit('guildCreate', guild);
	}

	logger.info(`SerpineBot is ready to process interactions.`);
};
