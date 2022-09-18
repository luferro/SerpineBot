import type { Guild } from 'discord.js';
import type { Bot } from '../structures/bot';
import { settingsModel } from '../database/models/settings';
import { EventName } from '../types/enums';
import { logger } from '../utils/logger';

export const data = {
	name: EventName.GuildDelete,
	type: 'on',
};

export const execute = async (_client: Bot, guild: Guild) => {
	await settingsModel.deleteOne({ guildId: guild.id });

	logger.info(`SerpineBot has left guild _*${guild.name}*_.`);
};
