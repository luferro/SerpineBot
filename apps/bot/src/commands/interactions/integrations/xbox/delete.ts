import { IntegrationsModel } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('delete')
	.setDescription('Delete your Xbox integration.');

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	await IntegrationsModel.deleteIntegrationByUserId({ userId: interaction.user.id, category: 'Xbox' });

	const embed = new EmbedBuilder().setTitle('Xbox integration deleted successfully.').setColor('Random');
	await interaction.editReply({ embeds: [embed] });
};
