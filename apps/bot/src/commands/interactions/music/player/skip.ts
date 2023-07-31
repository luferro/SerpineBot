import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('skip')
	.setDescription('Skips the current track.')
	.addIntegerOption((option) => option.setName('position').setDescription('Queue track position').setMinValue(1));

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const position = interaction.options.getInteger('position');

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue || !queue.currentTrack) throw new Error('Cannot skip track.');
	if (queue.isEmpty()) throw new Error('Queue is empty.');

	const currentTrack = queue.currentTrack;
	const nextTrack = queue.tracks.at(position ? position - 1 : 0);

	const isSuccessful = position ? queue.node.skipTo(position - 1) : queue.node.skip();
	if (!isSuccessful) throw new Error(`No track found in position \`${position}\`.`);

	const embed = new EmbedBuilder()
		.setTitle(`Skipped \`${currentTrack}\`.`)
		.setDescription(`Now playing \`${nextTrack}\`.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed] });
};
