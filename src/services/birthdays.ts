import { Client, Guild, TextChannel } from 'discord.js';
import * as Tenor from '../apis/tenor';
import { birthdaysModel } from '../database/models/birthdays';

export const create = async (userId: string, date: string) => {
	const isValid = Date.parse(date);
	if (!isValid) throw new Error('Invalid date.');

	await birthdaysModel.updateOne({ userId }, { $set: { date } }, { upsert: true });
};

export const getBirthdays = async (client: Client) => {
	const birthdays = await birthdaysModel.find();

	return Promise.all(
		birthdays.map(async (item) => {
			const { 1: month, 2: day } = item.date.split('-');
			const user = await client.users.fetch(item.userId);

			return {
				user,
				birthday: `${day.padStart(2, '0')}/${month.padStart(2, '0')}`,
			};
		}),
	);
};

export const remove = async (userId: string) => {
	await birthdaysModel.deleteOne({ userId });
};

export const send = async (guild: Guild, channelId: string, userId: string, birthday: string) => {
	const target = await guild.members.fetch(userId);
	if (!target) throw new Error(`Couldn't find a target with userId ${userId} in guild ${guild.name}.`);

	const channel = (await guild.channels.fetch(channelId)) as TextChannel | null;
	if (!channel) throw new Error(`Couldn't find a channel with channelId ${channelId} in guild ${guild.name}.`);

	const { 0: year, 1: month, 2: day } = birthday.split('-').map(Number);
	const dateDiff = Date.now() - new Date(year, month - 1, day).getTime();
	const age = Math.floor(dateDiff / (1000 * 60 * 60 * 24 * 365.25));

	const { gif } = await Tenor.search('Happy Birthday Meme');
	await channel.send({
		content: `${guild.roles.everyone}, ${target} is now ${age} years old! Happy birthday! 🎉🥳🎂🥳🎉\n${gif}`,
	});
};
