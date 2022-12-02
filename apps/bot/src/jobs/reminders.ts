import type { JobData } from '../types/bot';
import type { Bot } from '../structures/bot';
import * as Reminders from '../services/reminders';
import { remindersModel } from '../database/models/reminders';
import { JobName } from '../types/enums';
import { logger } from '@luferro/shared-utils';

export const data: JobData = {
	name: JobName.Reminders,
	schedule: '*/10 * * * * *',
};

export const execute = async (client: Bot) => {
	const reminders = await remindersModel.find().sort({ timeEnd: 'asc' });
	if (reminders.length === 0) return;

	const {
		0: { reminderId, userId, timeEnd },
	} = reminders;

	if (Date.now() < timeEnd) return;

	try {
		await Reminders.send(client, reminderId);
		const user = await client.users.fetch(userId);
		logger.info(`Job **${data.name}** notified **${user.tag}** regarding reminderId **${reminderId}**.`);
	} catch (error) {
		const { message } = error as Error;
		logger.warn(`Job **${data.name}** failed for reminderId **${reminderId}**. Reason: **${message}**`);
	}
};
