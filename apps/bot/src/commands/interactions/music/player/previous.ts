import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('previous')
	.setDescription('Plays the previous track.');

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue?.history.previousTrack) throw new Error('Cannot play previous track.');

	await queue.history.previous();

	const embed = new EmbedBuilder().setTitle(`Replaying \`${queue.history.currentTrack}\`.`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};
