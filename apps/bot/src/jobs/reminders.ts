import type { JobData } from '../types/bot';
import type { Bot } from '../structures/bot';
import * as Reminders from '../services/reminders';
import { remindersModel } from '../database/models/reminders';
import { JobName } from '../types/enums';
import { logger } from '@luferro/shared-utils';

export const data: JobData = {
	name: JobName.Reminders,
	schedule: '*/30 * * * * *',
};

export const execute = async (client: Bot) => {
	const reminders = await remindersModel.find().sort({ timeEnd: 'asc' });
	const filteredReminders = reminders.filter(({ timeEnd }) => Date.now() >= timeEnd);
	for (const { reminderId, userId } of filteredReminders) {
		try {
			await Reminders.send(client, reminderId);
			const user = await client.users.fetch(userId);
			logger.info(`Job **${data.name}** notified **${user.tag}** regarding reminderId **${reminderId}**.`);
		} catch (error) {
			const { message } = error as Error;
			logger.warn(`Job **${data.name}** failed for reminderId **${reminderId}**. **${message}**.`);
		}
	}
};
