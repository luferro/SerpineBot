import { Action, BirthdaysModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';

import { config } from '../config/environment';
import type { JobData, JobExecute } from '../types/bot';
import { JobName } from '../types/enums';

export const data: JobData = {
	name: JobName.Birthdays,
	schedule: '0 0 0 * * *',
};

export const execute: JobExecute = async ({ client }) => {
	const birthdays = await BirthdaysModel.getBirthdays();
	for (const { 1: guild } of client.guilds.cache) {
		const message = await client.settings.message().withGuild(guild).get({ category: Action.Birthdays });
		if (!message) continue;

		for (const { userId, date } of birthdays) {
			const currentDate = new Date();
			currentDate.setHours(0, 0, 0, 0);

			const { 1: month, 2: day } = date.split('-').map(Number);
			const birthdayDate = new Date(new Date().getFullYear(), month - 1, day);
			birthdayDate.setHours(0, 0, 0, 0);

			if (currentDate.getTime() !== birthdayDate.getTime()) continue;

			const { channelId } = message;
			if (!channelId) continue;

			try {
				const target = await guild.members.fetch(userId);
				if (!target) throw new Error(`No userId ${userId} in guild ${guild.name}.`);

				const channel = await guild.channels.fetch(channelId);
				if (!channel?.isTextBased()) throw new Error(`No channelId ${channelId} in guild ${guild.name}.`);

				const { 0: year } = date.split('-').map(Number);
				const age = new Date().getFullYear() - year;

				const gif = config.BIRTHDAY_GIFS[Math.floor(Math.random() * config.BIRTHDAY_GIFS.length)];
				const content = `${guild.roles.everyone}, ${target} is now ${age} years old! Happy birthday! 🎉🥳🎂🥳🎉`;
				await channel.send({ content: gif ? `${content}\n${gif}` : content });

				logger.info(`Job **${data.name}** notified channelId **${channelId}** in guild **${guild.name}**.`);
			} catch (error) {
				logger.warn(`Job **${data.name}** failed for userId **${userId}**. Reason: **${error}**`);
			}
		}
	}
};
