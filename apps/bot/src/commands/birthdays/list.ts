import { BirthdaysModel } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('list')
	.setDescription('Lists all registered birthdays.');

export const execute: CommandExecute = async ({ interaction }) => {
	const birthdaysList = await BirthdaysModel.getBirthdays();
	const birthdays = await Promise.all(
		birthdaysList.map(async ({ userId, date }) => {
			const { 1: month, 2: day } = date.split('-');
			const user = await interaction.client.users.fetch(userId);
			const birthday = `${day.padStart(2, '0')}/${month.padStart(2, '0')}`;

			return { user, birthday };
		}),
	);
	if (birthdays.length === 0) throw new Error('No birthdays have been registered.');

	const sortedBirthdays = birthdays.sort((a, b) => {
		const { 0: firstDateDay, 1: firstDateMonth } = a.birthday.split('/');
		const { 0: secondDateDay, 1: secondDateMonth } = b.birthday.split('/');

		const date = new Date();
		const firstDate = new Date(date.getFullYear(), Number(firstDateMonth) - 1, Number(firstDateDay));
		const secondDate = new Date(date.getFullYear(), Number(secondDateMonth) - 1, Number(secondDateDay));

		return firstDate.getTime() - secondDate.getTime();
	});
	const formattedBirthday = sortedBirthdays.map(({ birthday, user }) => `> **${birthday}** ${user.tag}`).join('\n');

	const embed = new EmbedBuilder().setTitle('Birthdays').setDescription(formattedBirthday).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};
