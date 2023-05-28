import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import * as Leaderboards from '../../services/leaderboards';
import { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('steam')
	.setDescription('Steam leaderboard for the week.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const leaderboard = await Leaderboards.getSteamLeaderboard(client);
	if (leaderboard.length === 0) throw new Error('No Steam leaderboard is available.');

	const embed = new EmbedBuilder()
		.setTitle('Weekly Steam Leaderboard')
		.setDescription(leaderboard.join('\n'))
		.setFooter({ text: 'Leaderboard resets every sunday at 00:00 UTC.' })
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
