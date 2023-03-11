import { Reminder, RemindersModel } from '@luferro/database';
import type { TimeUnit } from '@luferro/shared-utils';
import { ConverterUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { Bot } from '../structures/bot';

export const createReminder = async (userId: string, time: number, unit: TimeUnit, message: string) => {
	if (unit === 'Milliseconds' && time < 300_000) throw new Error('Minimum of 300000 milliseconds required.');
	if (unit === 'Seconds' && time < 300) throw new Error('Minimum of 300 seconds required.');
	if (unit === 'Minutes' && time < 5) throw new Error('Minimum of 5 minutes required.');

	const ms = unit !== 'Milliseconds' ? ConverterUtil.toMilliseconds(time, unit) : time;
	const timeStart = Date.now();
	const timeEnd = Date.now() + ms;

	const reminderId = await RemindersModel.createReminder(userId, timeStart, timeEnd, message);

	return { reminderId };
};

export const deleteReminder = async (reminderId: string) => {
	await RemindersModel.deleteOne({ reminderId });
};

export const sendReminder = async (client: Bot, reminder: Reminder) => {
	const { reminderId, userId, timeStart, message } = reminder;

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

	await deleteReminder(reminderId);
};
