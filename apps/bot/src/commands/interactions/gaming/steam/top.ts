import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { InteractionCommandExecute, InteractionCommandData } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('top')
	.setDescription("Steam's top played games.");

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const topPlayed = await client.api.gaming.steam.getTopPlayed();
	if (topPlayed.length === 0) throw new Error("No games were found in Steam's top played list.");

	const embed = new EmbedBuilder()
		.setTitle("Steam's Top Played")
		.setDescription(topPlayed.join('\n'))
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
