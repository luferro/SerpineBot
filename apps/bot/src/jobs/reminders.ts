import { RemindersModel } from '@luferro/database';
import { DateUtil, logger } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import type { JobData, JobExecute } from '../types/bot';

export const data: JobData = { schedule: '*/30 * * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const reminders = await RemindersModel.getReminders();
	const filteredReminders = reminders.filter(({ timeEnd }) => Date.now() >= timeEnd);
	for (const { reminderId, userId, timeStart, message } of filteredReminders) {
		const embed = new EmbedBuilder()
			.setTitle(t('jobs.reminders.embed.title', { date: DateUtil.formatDate(timeStart) }))
			.addFields([
				{
					name: `**${t('jobs.reminders.embed.fields.0.name')}**`,
					value: message.trim(),
				},
			])
			.setColor('Random');

		const target = await client.users.fetch(userId);
		await target.send({ embeds: [embed] });
		await RemindersModel.deleteOne({ reminderId });

		logger.info(`Notified **${target.username}** about reminderId **${reminderId}**.`);
	}
};
