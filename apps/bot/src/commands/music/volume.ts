import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('volume')
	.setDescription('Sets player volume.')
	.addIntegerOption((option) =>
		option
			.setName('volume')
			.setDescription('Player volume [0 - 100]%.')
			.setMinValue(0)
			.setMaxValue(100)
			.setRequired(true),
	);

export const execute: CommandExecute = async ({ client, interaction }) => {
	const volume = interaction.options.getInteger('volume', true);

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot change volume.');

	queue.node.setVolume(volume);

	const embed = new EmbedBuilder().setTitle(`Volume has been set to ${volume}%.`).setColor('Random');
	await interaction.reply({ embeds: [embed] });
};
