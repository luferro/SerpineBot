import type { Bot } from '../structures/bot';
import * as Birthdays from '../services/birthdays';
import { birthdaysModel } from '../database/models/birthdays';
import { settingsModel } from '../database/models/settings';
import { logger } from '../utils/logger';
import { JobName } from '../types/enums';

export const data = {
	name: JobName.Birthdays,
	schedule: '0 0 0 * * *',
};

export const execute = async (client: Bot) => {
	const birthdays = await birthdaysModel.find();
	for (const [guildId, guild] of client.guilds.cache) {
		for (const birthday of birthdays) {
			const currentDate = new Date();
			currentDate.setHours(0, 0, 0, 0);

			const { 1: month, 2: day } = birthday.date.split('-').map(Number);
			const birthdayDate = new Date(new Date().getFullYear(), month - 1, day);
			birthdayDate.setHours(0, 0, 0, 0);

			if (currentDate.getTime() !== birthdayDate.getTime()) continue;

			const settings = await settingsModel.findOne({ guildId });
			const channelId = settings?.birthdays.channelId;
			if (!channelId) continue;

			try {
				await Birthdays.send(guild, channelId, birthday.userId, birthday.date);
				logger.info(`Birthdays job sent a message to _*${channelId}*_ in guild _*${guild.name}*_.`);
			} catch (error) {
				logger.warn(`Birthdays job - ${(error as Error).message}`);
				continue;
			}
		}
	}
};
