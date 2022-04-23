import { Bot } from '../bot';
import * as Reminders from '../services/reminders';
import { remindersModel } from '../database/models/reminders';
import { logger } from '../utils/logger';

export const data = {
	name: 'reminders',
	schedule: '*/10 * * * * *',
};

export const execute = async (client: Bot) => {
	const reminders = await remindersModel.find().sort({ timeEnd: 'asc' });
	if (reminders.length === 0) return;

	const { reminderId, userId, timeEnd } = reminders[0];
	if (Date.now() < timeEnd) return;

	const result = await Reminders.send(client, reminderId).catch((error: Error) => error);
	if (result instanceof Error) {
		logger.warn(`Reminders job - ${result.message}.`);
		return;
	}

	const user = await client.users.fetch(userId);
	logger.info(`Reminders job notified _*${user.tag}*_ regarding reminder _*${reminderId}*_.`);
};
