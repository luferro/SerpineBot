import { logger } from '@luferro/shared-utils';
import type { Guild } from 'discord.js';

import type { Bot } from '../structures/Bot';
import type { EventData } from '../types/bot';
import { EventName } from '../types/enums';

export const data: EventData = {
	name: EventName.GuildCreate,
	type: 'on',
};

export const execute = async (client: Bot, guild: Guild) => {
	await client.settings.create(guild.id);
	logger.info(`Settings for **${guild.name}** have been created.`);
};
