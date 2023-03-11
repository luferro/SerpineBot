import { SettingsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';
import type { Guild } from 'discord.js';

import type { Bot } from '../structures/bot';
import type { EventData } from '../types/bot';
import { EventName } from '../types/enums';

export const data: EventData = {
	name: EventName.GuildDelete,
	type: 'on',
};

export const execute = async (_client: Bot, guild: Guild) => {
	await SettingsModel.deleteSettingsByGuildId(guild.id);
	logger.info(`Settings for **${guild.name}** have been deleted.`);
};
