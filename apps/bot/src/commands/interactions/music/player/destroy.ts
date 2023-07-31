import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import type { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('destroy')
	.setDescription('Destroy guild player.');

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot destroy guild player.');

	queue.delete();

	const embed = new EmbedBuilder().setTitle('Player destroyed.').setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};
