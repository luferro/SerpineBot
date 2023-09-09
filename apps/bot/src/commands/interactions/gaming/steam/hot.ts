import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.gaming.steam.hot.name'))
	.setDescription(t('interactions.gaming.steam.hot.description'));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const topSellers = await client.api.gaming.steam.getTopSellers();
	if (topSellers.length === 0) throw new Error(t('errors.search.none'));

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.gaming.steam.hot.embed.title'))
		.setDescription(topSellers.join('\n'))
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
