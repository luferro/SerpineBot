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

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const reminderId = interaction.options.getString(data.options[0].name, true);

	await client.prisma.reminder.delete({ where: { id: reminderId } });

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.reminders.delete.embed.title'))
		.setDescription(t('interactions.reminders.delete.embed.description', { reminderId: `**${reminderId}**` }))
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};
