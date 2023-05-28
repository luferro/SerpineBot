import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('bassboost')
	.setDescription('Toggles the bass boost filter.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot toggle bassboost.');

	await queue.filters.ffmpeg.toggle('bassboost');

	const embed = new EmbedBuilder().setTitle('Filter has been toggled.').setColor('Random');
	await interaction.reply({ embeds: [embed] });
};
