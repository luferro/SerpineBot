import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('shuffle')
	.setDescription('Shuffles the queue.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot shuffle queue.');

	queue.tracks.shuffle();

	const embed = new EmbedBuilder().setTitle('Queue has been shuffled.').setColor('Random');
	await interaction.reply({ embeds: [embed] });
};
