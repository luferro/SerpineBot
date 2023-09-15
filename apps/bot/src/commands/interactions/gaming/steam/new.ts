import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.gaming.steam.new.name'))
	.setDescription(t('interactions.gaming.steam.new.description'));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const upcoming = await client.api.gaming.steam.getChart({ chart: 'UPCOMING_GAMES' });
	if (upcoming.length === 0) throw new Error(t('errors.search.none'));

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.gaming.steam.new.embed.title'))
		.setDescription(upcoming.map(({ position, name, url }) => `\`${position}.\` [${name}](${url})`).join('\n'))
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
