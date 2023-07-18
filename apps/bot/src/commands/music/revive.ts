import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('revive')
	.setDescription('Revives the queue.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot revive queue.');

	queue.revive();

	const embed = new EmbedBuilder().setTitle('Player queue has been revived.').setColor('Random');
	await interaction.reply({ embeds: [embed] });
};
