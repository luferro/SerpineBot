import { RemindersModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../types/bot';
import { JobName } from '../types/enums';

export const data: JobData = {
	name: JobName.Reminders,
	schedule: '*/30 * * * * *',
};

export const execute: JobExecute = async ({ client }) => {
	const reminders = await RemindersModel.getReminders();
	const filteredReminders = reminders.filter(({ timeEnd }) => Date.now() >= timeEnd);
	for (const reminder of filteredReminders) {
		const { reminderId, userId, timeStart, message } = reminder;

		try {
			const target = await client.users.fetch(userId);
			if (!target) throw new Error(`Cannot find a target with userId ${userId}.`);

			const embed = new EmbedBuilder()
				.setTitle(`Reminder set on ${new Date(timeStart).toLocaleString('pt-PT')}`)
				.addFields([
					{
						name: '**Message**',
						value: message.trim(),
					},
				])
				.setColor('Random');

			await target.send({ embeds: [embed] });
			await RemindersModel.deleteOne({ reminderId });

			logger.info(`Job **${data.name}** notified **${target.tag}** regarding reminderId **${reminderId}**.`);
		} catch (error) {
			logger.warn(`Job **${data.name}** failed for reminderId **${reminderId}**. Reason: **${error}**.`);
		}
	}
};
