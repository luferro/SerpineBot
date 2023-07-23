import { SlashCommandSubcommandBuilder } from 'discord.js';

import { Bot } from '../../../structures/Bot';
import type { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('all')
	.setDescription('Removes every track in the queue.');

export const execute: CommandExecute = async ({ client, interaction }) => {
	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot clear queue.');

	queue.tracks.clear();

	await Bot.commands.execute.get('music.queue')!({ client, interaction });
};
