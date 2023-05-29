import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('hot')
	.setDescription("Steam's top sellers.");

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const topSellers = await client.api.gaming.steam.getTopSellers();
	if (topSellers.length === 0) throw new Error("No games were found in Steam's top sellers list.");

	const embed = new EmbedBuilder()
		.setTitle("Steam's Top Sellers")
		.setDescription(topSellers.join('\n'))
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};