import { RemindersModel } from '@luferro/database';
import { logger } from '@luferro/shared-utils';

import * as Reminders from '../services/reminders';
import type { Bot } from '../structures/bot';
import type { JobData } from '../types/bot';
import { JobName } from '../types/enums';

export const data: JobData = {
	name: JobName.Reminders,
	schedule: '*/30 * * * * *',
};

export const execute = async (client: Bot) => {
	const reminders = await RemindersModel.getReminders();
	const filteredReminders = reminders.filter(({ timeEnd }) => Date.now() >= timeEnd);
	for (const reminder of filteredReminders) {
		const { reminderId, userId } = reminder;

		try {
			await Reminders.sendReminder(client, reminder);
			const user = await client.users.fetch(userId);
			logger.info(`Job **${data.name}** notified **${user.tag}** regarding reminderId **${reminderId}**.`);
		} catch (error) {
			const { message } = error as Error;
			logger.warn(`Job **${data.name}** failed for reminderId **${reminderId}**. **${message}**.`);
		}
	}
};
