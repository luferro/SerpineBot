import type { Bot } from '../structures/bot';
import type { TimeUnit } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';
import { ConverterUtil } from '@luferro/shared-utils';
import { randomUUID } from 'crypto';
import { remindersModel } from '../database/models/reminders';
import type { Reminder } from '../types/schemas';

export const create = async (userId: string, time: number, unit: TimeUnit, message: string) => {
	if (unit === 'Milliseconds' && time < 300_000) throw new Error('Minimum of 300000 milliseconds required.');
	if (unit === 'Seconds' && time < 300) throw new Error('Minimum of 300 seconds required.');
	if (unit === 'Minutes' && time < 5) throw new Error('Minimum of 5 minutes required.');

	const ms = unit !== 'Milliseconds' ? ConverterUtil.toMilliseconds(time, unit) : time;

	const reminderId = randomUUID();
	const timeStart = Date.now();
	const timeEnd = Date.now() + ms;

	await new remindersModel({ reminderId, userId, timeStart, timeEnd, message }).save();

	return { reminderId };
};

export const remove = async (reminderId: string) => {
	await remindersModel.deleteOne({ reminderId });
};

export const send = async (client: Bot, reminder: Reminder) => {
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

	await remove(reminderId);
};
