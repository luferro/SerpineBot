import { BirthdaysModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../types/bot';

export const data: JobData = { schedule: '0 0 0 * * *' };

export const execute: JobExecute = async ({ client }) => {
	const birthdays = await BirthdaysModel.getUpcomingBirthdays();
	for (const { userId, date } of birthdays) {
		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);

		date.setFullYear(currentDate.getFullYear());
		date.setHours(0, 0, 0, 0);

		if (currentDate.getTime() !== date.getTime()) continue;

		try {
			const target = await client.users.fetch(userId);
			if (!target) throw new Error(`No userId ${userId} found.`);

			const age = currentDate.getFullYear() - date.getFullYear();

			const embed = new EmbedBuilder()
				.setTitle('🎉🥳🎂🥳🎉 Happy Birthday! 🎉🥳🎂🥳🎉')
				.setDescription(`\`${target.username}\` is now ${age} years old!`)
				.setThumbnail(target.avatarURL() ?? target.defaultAvatarURL);

			await client.propageMessages({ category: 'Birthdays', everyone: true, embeds: [embed] });

			logger.info(`Notified guild users about **${target.username}** birthday.`);
		} catch (error) {
			logger.warn(`Failed to notify guild users about **${userId}** birthday. Reason: **${error}**`);
		}
	}
};
