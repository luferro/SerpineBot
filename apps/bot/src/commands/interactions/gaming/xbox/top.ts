import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.gaming.xbox.top.name'))
	.setDescription(t('interactions.gaming.xbox.top.description'));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const topPlayed = await client.api.gaming.xbox.getChart({ chart: 'TOP_PLAYED' });
	if (topPlayed.length === 0) throw new Error(t('errors.search.none'));

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.gaming.xbox.top.embed.title'))
		.setDescription(topPlayed.map(({ position, name, url }) => `\`${position}.\` [${name}](${url})`).join('\n'))
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
