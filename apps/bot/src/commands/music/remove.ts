import { SlashCommandSubcommandBuilder } from 'discord.js';

import { Bot } from '../../structures/Bot';
import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('remove')
	.setDescription('Removes a track from the queue.')
	.addIntegerOption((option) =>
		option
			.setName('position')
			.setDescription('Position in the queue of the item you wish to remove.')
			.setRequired(true),
	);

export const execute: CommandExecute = async ({ client, interaction }) => {
	const position = interaction.options.getInteger('position', true);

	const queue = client.player.nodes.get(interaction.guild.id);
	if (!queue || queue.isEmpty()) throw new Error(`Cannot remove position ${position} from queue.`);

	queue.node.remove(position - 1);

	const execute = Bot.commands.execute.get('music.queue');
	if (!execute) throw new Error('Cannot display guild queue.');
	await execute({ client, interaction });
};
