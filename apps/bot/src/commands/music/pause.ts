import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('pause')
	.setDescription('Pauses the current track.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot pause track.');

	queue.node.setPaused(true);

	const embed = new EmbedBuilder().setTitle(`Pausing \`${queue.currentTrack}\`.`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};
