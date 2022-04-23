import { Guild } from 'discord.js';
import { Bot } from '../bot';
import { settingsModel } from '../database/models/settings';
import { logger } from '../utils/logger';

export const data = {
	name: 'guildDelete',
	once: false,
};

export const execute = async (client: Bot, guild: Guild) => {
	await settingsModel.deleteOne({ guildId: guild.id });

	logger.info(`SerpineBot has left guild _*${guild.name}*_.`);
};
