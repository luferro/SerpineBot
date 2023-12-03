import { WebhookType } from '@luferro/database';
import { logger } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import type { JobData, JobExecute } from '../types/bot';

export const data: JobData = { schedule: '0 0 0 * * *' };

export const execute: JobExecute = async ({ client }) => {
	const birthdays = await client.prisma.birthday.findMany({
		where: {
			OR: [
				{ AND: [{ day: { gte: new Date().getDate() } }, { month: { equals: new Date().getMonth() + 1 } }] },
				{ month: { gte: new Date().getMonth() + 1 } },
			],
		},
	});

	for (const { userId, day, month, year } of birthdays) {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		const birthdate = new Date(day, month - 1, date.getFullYear());
		birthdate.setHours(0, 0, 0, 0);
		if (date.getTime() !== birthdate.getTime()) continue;

		const target = await client.users.fetch(userId);

		await client.propagate({
			type: WebhookType.BIRTHDAYS,
			cache: false,
			everyone: true,
			fields: ['title', 'description', 'thumbnail'],
			messages: [
				new EmbedBuilder()
					.setTitle(t('jobs.birthdays.embed.title'))
					.setDescription(
						t('jobs.birthdays.embed.description', {
							username: target.username,
							age: date.getFullYear() - year,
						}),
					)
					.setThumbnail(target.avatarURL() ?? target.defaultAvatarURL),
			],
		});
		logger.info(`Notified guild users about **${target.username}** birthday.`);
	}
};
