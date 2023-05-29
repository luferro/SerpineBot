import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import * as Leaderboards from '../../services/leaderboards';
import { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('xbox')
	.setDescription('Xbox leaderboard for the week.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const leaderboard = await Leaderboards.getXboxLeaderboard(client);
	if (leaderboard.length === 0) throw new Error('No Xbox leaderboard is available.');

	const embed = new EmbedBuilder()
		.setTitle('Weekly Xbox Leaderboard')
		.setDescription(leaderboard.join('\n'))
		.setFooter({ text: 'Leaderboard resets every sunday at 00:00 UTC.' })
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};