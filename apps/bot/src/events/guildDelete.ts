import { logger } from '@luferro/shared-utils';
import type { Guild } from 'discord.js';

import type { Bot } from '../structures/Bot';
import type { EventData } from '../types/bot';

export const data: EventData = { type: 'on' };

export const execute = async (client: Bot, guild: Guild) => {
	await client.settings.delete(guild.id);
	logger.info(`Settings for **${guild.name}** have been deleted.`);
};
