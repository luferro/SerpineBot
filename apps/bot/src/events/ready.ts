import { SettingsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';

import * as CommandsHandler from '../handlers/commands';
import type { Bot } from '../structures/bot';
import type { EventData } from '../types/bot';
import { EventName } from '../types/enums';

export const data: EventData = {
	name: EventName.Ready,
	type: 'once',
};

export const execute = async (client: Bot) => {
	await CommandsHandler.deployCommands(client);

	for (const [guildId, guild] of client.guilds.cache) {
		const settings = await SettingsModel.getSettingsByGuildId(guildId);
		if (!settings) client.emit('guildCreate', guild);
	}

	logger.info(`SerpineBot is ready to process interactions.`);
};
