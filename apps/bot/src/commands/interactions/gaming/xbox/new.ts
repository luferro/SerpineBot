import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.gaming.xbox.new.name'))
	.setDescription(t('interactions.gaming.xbox.new.description'));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const upcoming = await client.api.gaming.xbox.getUpcoming();
	if (upcoming.length === 0) throw new Error(t('errors.search.none'));

	const embed = new EmbedBuilder()
		.setTitle(t('interactions.gaming.xbox.new.embed.title'))
		.setDescription(upcoming.join('\n'))
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
