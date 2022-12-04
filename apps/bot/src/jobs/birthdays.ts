import type { JobData } from '../types/bot';
import type { Bot } from '../structures/bot';
import { logger } from '@luferro/shared-utils';
import * as Birthdays from '../services/birthdays';
import { birthdaysModel } from '../database/models/birthdays';
import { settingsModel } from '../database/models/settings';
import { JobName } from '../types/enums';

export const data: JobData = {
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
				logger.info(`Job **${data.name}** notified channelId **${channelId}** in guild **${guild.name}**.`);
			} catch (error) {
				const { message } = error as Error;
				logger.warn(`Job **${data.name}** failed for userId **${birthday.userId}**. **${message}**`);
			}
		}
	}
};
