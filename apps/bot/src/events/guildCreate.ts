import { SettingsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';
import type { Guild } from 'discord.js';

import type { Bot } from '../structures/Bot';
import type { EventData } from '../types/bot';

export const data: EventData = { type: 'on' };

export const execute = async (_client: Bot, guild: Guild) => {
	await SettingsModel.createSettings({
		guildId: guild.id,
		roles: { channelId: null, options: [] },
		webhooks: new Map(),
	});
	logger.info(`Settings for **${guild.name}** have been created.`);
};
