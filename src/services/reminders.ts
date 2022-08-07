import { EmbedBuilder } from 'discord.js';
import { randomUUID } from 'crypto';
import { Bot } from '../bot';
import * as ConverterUtil from '../utils/converter';
import { remindersModel } from '../database/models/reminders';
import { TimeUnit } from '../types/enums';

export const create = async (userId: string, time: number, unit: TimeUnit, message: string) => {
	if (unit === TimeUnit.Seconds && time < 300) throw new Error('Time has to be greater or equal than 300 seconds.');
	if (unit === TimeUnit.Minutes && time < 5) throw new Error('Time has to be greater or equal than 5 minutes.');

	const ms = ConverterUtil.timeToMilliseconds(time, unit);

	const reminderId = randomUUID();
	const timeStart = Date.now();
	const timeEnd = Date.now() + ms;

	await new remindersModel({
		reminderId,
		userId,
		timeStart,
		timeEnd,
		message,
	}).save();

	return {
		reminderId,
	};
};

export const remove = async (reminderId: string) => {
	await remindersModel.deleteOne({ reminderId });
};

export const send = async (client: Bot, reminderId: string) => {
	const reminder = await remindersModel.findOne({ reminderId });
	const { userId, timeStart, message } = reminder!;

	const target = await client.users.fetch(userId);
	if (!target) throw new Error(`Couldn't find a target with userId ${userId}.`);

	const reminderDate = new Date(timeStart).toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' });

	const embed = new EmbedBuilder()
		.setTitle(`Reminder set on ${reminderDate}`)
		.setDescription(`**Message**:\n${message.trim()}`)
		.setColor('Random');

	await target.send({ embeds: [embed] });

	await remove(reminderId);
};
