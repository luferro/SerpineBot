import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('jump')
	.setDescription('Jump to specific track.')
	.addIntegerOption((option) =>
		option.setName('position').setDescription('Queue track position').setMinValue(1).setRequired(true),
	);

export const execute: CommandExecute = async ({ client, interaction }) => {
	const position = interaction.options.getInteger('position', true);

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot jump to track.');

	const nextTrack = queue.tracks.at(position - 1);
	queue.node.jump(position - 1);

	const embed = new EmbedBuilder().setTitle(`Jumped to \`${nextTrack}\`.`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};
