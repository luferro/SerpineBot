import { RemindersModel } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.reminders.delete.name'))
	.setDescription(t('interactions.reminders.delete.description'))
	.addStringOption((option) =>
		option
			.setName(t('interactions.reminders.delete.options.0.name'))
			.setDescription(t('interactions.reminders.delete.options.0.description'))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	const reminderId = interaction.options.getString(t('interactions.reminders.delete.options.0.name'), true);

	await RemindersModel.deleteReminderById({ reminderId });

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.reminders.delete.embed.title', { reminderId: `**${reminderId}**` }))
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};
