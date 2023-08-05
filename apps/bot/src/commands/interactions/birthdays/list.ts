import { BirthdaysModel } from '@luferro/database';
import { DateUtil, StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

type GroupedBirthdays = { month: string; birthdays: Awaited<ReturnType<typeof BirthdaysModel.getAllBirthdays>> };

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('list')
	.setDescription('Lists all registered birthdays.');

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	const birthdaysList = await BirthdaysModel.getAllBirthdays();
	const groupedBirthdays = birthdaysList
		.sort((a, b) => a.date.getDate() - b.date.getDate() && a.date.getMonth() - b.date.getMonth())
		.reduce((acc, birthday) => {
			const month = StringUtil.capitalize(DateUtil.formatDate(birthday.date, 'MMMM'));

			const monthIndex = acc.findIndex((entry) => entry.month === month);
			if (monthIndex === -1) acc.push({ month, birthdays: [birthday] });
			else acc[monthIndex] = { month, birthdays: acc[monthIndex].birthdays.concat(birthday) };

			return acc;
		}, [] as GroupedBirthdays[]);
	if (groupedBirthdays.length === 0) throw new Error('No birthdays have been registered.');

	const fields = await Promise.all(
		groupedBirthdays.map(async ({ month, birthdays }) => {
			const formattedBirthdays = await Promise.all(
				birthdays.map(async ({ userId, date }) => {
					const user = await interaction.client.users.fetch(userId);
					const birthday = DateUtil.formatDate(date, 'dd/MM');
					return `**${birthday}** ${user.username}`;
				}),
			);

			return { name: month, value: formattedBirthdays.join('\n'), inline: true };
		}),
	);

	const embed = new EmbedBuilder().setTitle('Birthdays').setFields(fields).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};
