import { SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('destroy')
	.setDescription('Destroy guild player.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot destroy guild player.');

	queue.delete();

	await interaction.reply({ content: 'Guild player destroyed.', ephemeral: true });
};
