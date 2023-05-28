import { SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('leave')
	.setDescription('Bot leaves your voice channel.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot destroy guild queue.');

	queue.delete();

	await interaction.reply({ content: 'I have left your voice channel.', ephemeral: true });
};
