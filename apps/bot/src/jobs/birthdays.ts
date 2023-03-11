import { BirthdaysModel, MessageCategory, SettingsModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';

import * as Birthdays from '../services/birthdays';
import type { Bot } from '../structures/bot';
import type { JobData } from '../types/bot';
import { JobName } from '../types/enums';

export const data: JobData = {
	name: JobName.Birthdays,
	schedule: '0 0 0 * * *',
};

export const execute = async (client: Bot) => {
	const birthdays = await BirthdaysModel.getBirthdays();
	for (const [guildId, guild] of client.guilds.cache) {
		for (const birthday of birthdays) {
			const currentDate = new Date();
			currentDate.setHours(0, 0, 0, 0);

			const { 1: month, 2: day } = birthday.date.split('-').map(Number);
			const birthdayDate = new Date(new Date().getFullYear(), month - 1, day);
			birthdayDate.setHours(0, 0, 0, 0);

			if (currentDate.getTime() !== birthdayDate.getTime()) continue;

			const settings = await SettingsModel.getSettingsByGuildId(guildId);
			const channelId = settings?.messages[MessageCategory.Birthdays].channelId;
			if (!channelId) continue;

			try {
				await Birthdays.sendBirthdayMessage(guild, channelId, birthday.userId, birthday.date);
				logger.info(`Job **${data.name}** notified channelId **${channelId}** in guild **${guild.name}**.`);
			} catch (error) {
				const { message } = error as Error;
				logger.warn(`Job **${data.name}** failed for userId **${birthday.userId}**. **${message}**`);
			}
		}
	}
};
