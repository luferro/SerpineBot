import { SlashCommandSubcommandBuilder } from 'discord.js';

import { Bot } from '../../structures/Bot';
import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('shuffle')
	.setDescription('Shuffles the queue.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue || queue.isEmpty()) throw new Error('Cannot shuffle queue.');

	queue.tracks.shuffle();

	const execute = Bot.commands.execute.get('music.queue');
	if (!execute) throw new Error('Cannot display guild queue.');
	await execute({ client, interaction });
};
