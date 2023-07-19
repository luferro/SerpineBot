import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('skip')
	.setDescription('Skips the current track.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue || !queue.currentTrack) throw new Error('Cannot skip track.');
	if (queue.isEmpty()) throw new Error('No more tracks to skip to.');

	const { currentTrack } = queue;
	const nextTrack = queue.tracks.at(0)!;

	queue.node.skip();

	const embed = new EmbedBuilder()
		.setTitle(`Skipped \`${currentTrack}\`.`)
		.setDescription(`Now playing \`${nextTrack}\`.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};
