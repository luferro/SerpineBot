import { BirthdaysModel } from '@luferro/database';
import { DateUtil } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('create')
	.setDescription('Register your birthday.')
	.addIntegerOption((option) => option.setName('day').setDescription('Birth day.').setRequired(true))
	.addIntegerOption((option) => option.setName('month').setDescription('Birth month.').setRequired(true))
	.addIntegerOption((option) => option.setName('year').setDescription('Birth year.').setRequired(true));

export const execute: CommandExecute = async ({ interaction }) => {
	const day = interaction.options.getInteger('day', true);
	const month = interaction.options.getInteger('month', true);
	const year = interaction.options.getInteger('year', true);

	const date = `${year}-${month}-${day}`;
	if (!DateUtil.isValidDate(date)) throw new Error('Invalid date.');

	const isBirthdayRegistered = await BirthdaysModel.isBirthdayRegistered({ userId: interaction.user.id });
	if (isBirthdayRegistered) throw new Error('Birthday is already registered.');

	await BirthdaysModel.createBirthday({ userId: interaction.user.id, date });

	const embed = new EmbedBuilder().setTitle(`Your birthday has been registered.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};
