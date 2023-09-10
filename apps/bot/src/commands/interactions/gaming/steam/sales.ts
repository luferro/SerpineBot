import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.gaming.steam.sales.name'))
	.setDescription(t('interactions.gaming.steam.sales.description'));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const { sale, status, upcoming } = await client.api.gaming.steam.getNextSales();
	if (!sale) throw new Error(t('errors.search.none'));

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.gaming.steam.sales.embed.title'))
		.setDescription(`*${status || ''}*\n**${sale}**`)
		.addFields([
			{
				name: `**${t('interactions.gaming.steam.sales.embed.fields.0.name')}**`,
				value: upcoming.join('\n') || t('common.unavailable'),
			},
		])
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
