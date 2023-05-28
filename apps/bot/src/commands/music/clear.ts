import { SlashCommandSubcommandBuilder } from 'discord.js';

import { Bot } from '../../structures/Bot';
import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('clear')
	.setDescription('Removes every track in the queue.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot clear queue.');

	queue.tracks.clear();

	const execute = Bot.commands.execute.get('music.queue');
	if (!execute) throw new Error('Cannot display guild queue.');
	await execute({ client, interaction });
};
