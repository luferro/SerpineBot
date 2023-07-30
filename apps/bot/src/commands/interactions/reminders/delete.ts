import { RemindersModel } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { InteractionCommandExecute, InteractionCommandData } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('delete')
	.setDescription('Delete a reminder.')
	.addStringOption((option) => option.setName('id').setDescription('Reminder id.').setRequired(true));

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	const reminderId = interaction.options.getString('id', true);

	await RemindersModel.deleteReminderById({ reminderId });
	const embed = new EmbedBuilder().setTitle(`Reminder ${reminderId} has been deleted.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};
