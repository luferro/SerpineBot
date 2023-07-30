import { IntegrationsModel } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('notifications')
	.setDescription('Toggle notifications on or off for your Steam integration.')
	.addBooleanOption((option) => option.setName('toggle').setDescription('Notifications toggle.').setRequired(true));

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	const toggle = interaction.options.getBoolean('toggle', true);

	await IntegrationsModel.updateNotifications({ userId: interaction.user.id, notifications: toggle });

	const state = toggle ? 'on' : 'off';
	const embed = new EmbedBuilder().setTitle(`Steam notifications have been turned ${state}.`).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};
