import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('top')
	.setDescription("Xbox's top played games.");

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const topPlayed = await client.api.gaming.xbox.getTopPlayed();
	if (topPlayed.length === 0) throw new Error("No games were found in Xbox's top played list.");

	const embed = new EmbedBuilder()
		.setTitle("Xbox's Top Played")
		.setDescription(topPlayed.join('\n'))
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
