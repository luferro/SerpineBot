import { BirthdaysModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../types/bot';

export const data: JobData = { schedule: '0 0 0 * * *' };

export const execute: JobExecute = async ({ client }) => {
	const birthdays = await BirthdaysModel.getBirthdays();
	for (const { userId, date } of birthdays) {
		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);

		const { 1: month, 2: day } = date.split('-').map(Number);
		const birthdayDate = new Date(new Date().getFullYear(), month - 1, day);
		birthdayDate.setHours(0, 0, 0, 0);

		if (currentDate.getTime() !== birthdayDate.getTime()) continue;

		try {
			const target = await client.users.fetch(userId);
			if (!target) throw new Error(`No userId ${userId} found.`);

			const { 0: year } = date.split('-').map(Number);
			const age = new Date().getFullYear() - year;

			const embed = new EmbedBuilder()
				.setTitle('🎉🥳🎂🥳🎉 Happy Birthday! 🎉🥳🎂🥳🎉')
				.setDescription(`\`${target.tag}\` is now ${age} years old!`)
				.setThumbnail(target.avatar);

			await client.propageMessages({ category: 'Birthdays', everyone: true, embeds: [embed] });

			logger.info(`Notified guild users about **${target.tag}** birthday.`);
		} catch (error) {
			logger.warn(`Failed to notify guild users about **${userId}** birthday. Reason: **${error}**`);
		}
	}
};
