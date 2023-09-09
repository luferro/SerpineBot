import { BirthdaysModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

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

		const target = await client.users.fetch(userId);

		const age = currentDate.getFullYear() - date.getFullYear();

		const embed = new EmbedBuilder()
			.setTitle(t('jobs.birthday.embed.title'))
			.setDescription(t('jobs.birthday.embed.description', { username: `\`${target.username}\``, age }))
			.setThumbnail(target.avatarURL() ?? target.defaultAvatarURL);

		await client.propageMessages({ category: 'Birthdays', everyone: true, embeds: [embed] });

		logger.info(`Notified guild users about **${target.username}** birthday.`);
	}
};
