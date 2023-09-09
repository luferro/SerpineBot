import { IntegrationsModel } from '@luferro/database';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.integrations.steam.delete.name'))
	.setDescription(t('interactions.integrations.steam.delete.description'));

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	await interaction.deferReply({ ephemeral: true });

	await IntegrationsModel.deleteIntegrationByUserId({ userId: interaction.user.id, category: 'Steam' });

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.integrations.steam.delete.embed.title'))
		.setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};
