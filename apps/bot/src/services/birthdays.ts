import { BirthdaysModel } from '@luferro/database';
import { DateUtil } from '@luferro/shared-utils';
import { TenorApi } from '@luferro/tenor-api';
import type { Client, Guild } from 'discord.js';

export const createBirthday = async (userId: string, date: string) => {
	const isValid = DateUtil.isValidDate(date);
	if (!isValid) throw new Error('Invalid date.');

	await BirthdaysModel.createOrUpdateBirthday(userId, date);
};

export const getBirthdays = async (client: Client) => {
	const birthdays = await BirthdaysModel.getBirthdays();

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

export const deleteBirthday = async (userId: string) => {
	await BirthdaysModel.deleteBirthdayById(userId);
};

export const sendBirthdayMessage = async (guild: Guild, channelId: string, userId: string, birthday: string) => {
	const target = await guild.members.fetch(userId);
	if (!target) throw new Error(`Cannot find userId ${userId} in guild ${guild.name}.`);

	const channel = await guild.channels.fetch(channelId);
	if (!channel?.isTextBased()) throw new Error(`Cannot find channelId ${channelId} in guild ${guild.name}.`);

	const { 0: year } = birthday.split('-').map(Number);
	const age = new Date().getFullYear() - year;

	const { gif } = await TenorApi.getRandomGif('Happy Birthday Meme');
	await channel.send({
		content: `${guild.roles.everyone}, ${target} is now ${age} years old! Happy birthday! 🎉🥳🎂🥳🎉\n${gif}`,
	});
};
