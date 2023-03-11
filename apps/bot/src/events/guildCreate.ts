import { SettingsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';
import type { Guild } from 'discord.js';

import type { Bot } from '../structures/bot';
import type { EventData } from '../types/bot';
import { EventName } from '../types/enums';

export const data: EventData = {
	name: EventName.GuildCreate,
	type: 'on',
};

export const execute = async (_client: Bot, guild: Guild) => {
	await SettingsModel.createGuildSettings(guild.id, { messages: [], webhooks: [] });
	logger.info(`Settings for **${guild.name}** have been created.`);
};
