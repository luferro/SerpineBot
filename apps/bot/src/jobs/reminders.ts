import type { Bot } from '../structures/bot';
import * as Reminders from '../services/reminders';
import { remindersModel } from '../database/models/reminders';
import { JobName } from '../types/enums';
import { logger } from '@luferro/shared-utils';

export const data = {
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
		logger.info(`Reminders job notified **${user.tag}** regarding reminder **${reminderId}**.`);
	} catch (error) {
		logger.warn(`Reminders job failed. Reason: ${(error as Error).message}.`);
		return;
	}
};
