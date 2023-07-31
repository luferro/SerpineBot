import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('new')
	.setDescription("Xbox's upcoming games.");

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const upcoming = await client.api.gaming.xbox.getUpcoming();
	if (upcoming.length === 0) throw new Error("No games were found in Xbox's upcoming list.");

	const embed = new EmbedBuilder()
		.setTitle("Xbox's Upcoming Games")
		.setDescription(upcoming.join('\n'))
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
