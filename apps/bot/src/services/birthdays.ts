import type { Client, Guild } from 'discord.js';
import { TenorApi } from '@luferro/tenor-api';
import { birthdaysModel } from '../database/models/birthdays';

export const create = async (userId: string, date: string) => {
	const isValid = Date.parse(date);
	if (!isValid) throw new Error('Invalid date.');

	await birthdaysModel.updateOne({ userId }, { $set: { date } }, { upsert: true });
};

export const remove = async (userId: string) => {
	await birthdaysModel.deleteOne({ userId });
};

export const getBirthdays = async (client: Client) => {
	const birthdays = await birthdaysModel.find();

	return Promise.all(
		birthdays.map(async ({ userId, date }) => {
			const { 1: month, 2: day } = date.split('-');
			const user = await client.users.fetch(userId);

			return {
				user,
				birthday: `${day.padStart(2, '0')}/${month.padStart(2, '0')}`,
			};
		}),
	);
};

export const send = async (guild: Guild, channelId: string, userId: string, birthday: string) => {
	const target = await guild.members.fetch(userId);
	if (!target) throw new Error(`Couldn't find a user with userId ${userId} in guild ${guild.name}.`);

	const channel = await guild.channels.fetch(channelId);
	if (!channel?.isTextBased())
		throw new Error(`Couldn't find a channel with channelId ${channelId} in guild ${guild.name}.`);

	const { 0: year } = birthday.split('-').map(Number);
	const age = new Date().getFullYear() - year;

	const { gif } = await TenorApi.getRandomGif('Happy Birthday Meme');
	await channel.send({
		content: `${guild.roles.everyone}, ${target} is now ${age} years old! Happy birthday! 🎉🥳🎂🥳🎉\n${gif}`,
	});
};
