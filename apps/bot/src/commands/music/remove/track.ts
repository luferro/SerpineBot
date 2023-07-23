import { SlashCommandSubcommandBuilder } from 'discord.js';

import { Bot } from '../../../structures/Bot';
import type { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('track')
	.setDescription('Removes a track from the queue.')
	.addIntegerOption((option) =>
		option.setName('position').setDescription('Queue position').setMinValue(1).setRequired(true),
	);

export const execute: CommandExecute = async ({ client, interaction }) => {
	const position = interaction.options.getInteger('position', true);

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue) throw new Error('Cannot remove tracks.');

	const removedTrack = queue.node.remove(position - 1);
	if (!removedTrack) throw new Error(`No track found in position \`${position}\`.`);

	await Bot.commands.execute.get('music.queue')!({ client, interaction });
};
