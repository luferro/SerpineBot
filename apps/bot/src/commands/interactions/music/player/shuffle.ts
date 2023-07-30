import { SlashCommandSubcommandBuilder } from 'discord.js';

import { Bot } from '../../../../Bot';
import type { InteractionCommandData, InteractionCommandExecute } from '../../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName('shuffle')
	.setDescription('Shuffles the queue.');

export const execute: InteractionCommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue || queue.isEmpty()) throw new Error('Cannot shuffle queue.');

	queue.tracks.shuffle();

	await Bot.commands.interactions.execute.get('music.queue.list')!({ client, interaction });
};
