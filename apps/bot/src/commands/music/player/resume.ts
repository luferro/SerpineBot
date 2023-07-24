import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('resume')
	.setDescription('Resumes paused track.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot resume track.');

	queue.node.setPaused(false);

	const embed = new EmbedBuilder().setTitle(`Resuming \`${queue.currentTrack}\`.`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};
