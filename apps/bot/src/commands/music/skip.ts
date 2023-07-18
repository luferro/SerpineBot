import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('skip')
	.setDescription('Skips the current track.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot skip track.');
	if (queue.isEmpty()) throw new Error('No more tracks to skip to.');

	queue.node.skip();

	const embed = new EmbedBuilder()
		.setTitle(`Skipped \`${queue.currentTrack}\`.`)
		.setDescription(`Now playing \`${queue.tracks.at(0)}\`.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};
