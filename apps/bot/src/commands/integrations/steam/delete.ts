import { Integration, IntegrationsModel } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('delete')
	.setDescription('Delete your Steam integration.');

export const execute: CommandExecute = async ({ interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	await IntegrationsModel.checkIfIntegrationIsInPlace(interaction.user.id, Integration.Steam);
	await IntegrationsModel.deleteIntegrationByUserId(interaction.user.id, Integration.Steam);

	const embed = new EmbedBuilder().setTitle('Steam integration deleted successfully.').setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};
