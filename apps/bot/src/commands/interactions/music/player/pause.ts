import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('pause')
	.setDescription('Pauses the current track.');

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue?.currentTrack) throw new Error('No track is playing.');

	queue.node.setPaused(true);

	const embed = new EmbedBuilder().setTitle(`Pausing \`${queue.currentTrack}\`.`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};
