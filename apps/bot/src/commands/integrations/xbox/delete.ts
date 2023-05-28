import { Integration, IntegrationsModel } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('delete')
	.setDescription('Delete your Xbox integration.');

export const execute: CommandExecute = async ({ interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	await IntegrationsModel.checkIfIntegrationIsInPlace(interaction.user.id, Integration.Xbox);
	await IntegrationsModel.deleteIntegrationByUserId(interaction.user.id, Integration.Xbox);

	const embed = new EmbedBuilder().setTitle('Xbox integration deleted successfully.').setColor('Random');
	await interaction.editReply({ embeds: [embed] });
};
